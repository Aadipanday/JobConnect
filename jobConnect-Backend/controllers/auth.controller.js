import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Cookie security options for production
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
};

/**
 * Helper to generate Access and Refresh tokens using User model methods
 * and store the refresh token in the database.
 */
export const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token",
      [error.message]
    );
  }
};

/**
 * @desc    Register a new user (Candidate or Recruiter)
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Please provide name, email, and password");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Determine role: allow candidate or recruiter; prevent self-assigning admin
  let userRole = "candidate";
  if (role && (role === "candidate" || role === "recruiter")) {
    userRole = role;
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: userRole,
  });

  // Calculate initial profile completion
  user.calculateProfileCompletion();
  await user.save();

  // Generate tokens via model methods
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
          refreshToken,
          token: accessToken, // backward-compatibility
          role: createdUser.role, // backward-compatibility
        },
        "User registered successfully"
      )
    );
});

/**
 * @desc    Login user & generate access + refresh tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new ApiError(404, "User does not exist with this email");
  }

  // Check banned status
  if (user.role === "banned" || user.status === "banned") {
    throw new ApiError(403, "Your account has been suspended. Please contact support.");
  }

  // Check password using model method
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate access & refresh tokens via model methods
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
          token: accessToken, // backward-compatibility
          role: loggedInUser.role, // backward-compatibility
        },
        "User logged in successfully"
      )
    );
});

/**
 * @desc    Refresh Access Token using valid Refresh Token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized: Refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decodedToken._id || decodedToken.id).select("+refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token: user not found");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or has been used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
            token: accessToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me or GET /api/user/profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile retrieved successfully"));
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { name, bio, skills, resumeUrl, company, title } = req.body;

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills
      : skills.split(",").map((s) => s.trim());
  }
  if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
  if (company !== undefined) user.company = company;
  if (title !== undefined) user.title = title;

  user.calculateProfileCompletion();
  await user.save();

  const updatedUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
});
