import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * JWT Verification Middleware (protect)
 * Checks cookies and Authorization header
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: token is missing");
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decodedToken._id || decodedToken.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token: user not found");
    }

    if (user.role === "banned" || user.status === "banned") {
      throw new ApiError(
        403,
        "Your account has been suspended. Please contact platform support."
      );
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid or expired access token");
  }
});

/**
 * Role-Based Access Control Middleware
 * @param  {...string} roles - Allowed roles e.g. "recruiter", "admin"
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied: Role '${req.user?.role || "guest"}' is not authorized to perform this action`
      );
    }
    next();
  };
};

export default protect;
