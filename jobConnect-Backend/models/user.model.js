import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Do not expose password hash in default queries
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin", "banned"],
      default: "candidate",
    },
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    profileCompletion: {
      type: Number,
      default: 20,
    },
    refreshToken: {
      type: String,
      select: false, // Hide refresh token from default queries
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain-text password with hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Backward-compatible alias
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Generate short-lived Access Token
 * Payload includes _id, id, email, name, role
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

/**
 * Generate long-lived Refresh Token
 * Payload includes _id, id
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",
    }
  );
};

// Calculate candidate/user profile completion percentage
userSchema.methods.calculateProfileCompletion = function () {
  let score = 20;
  if (this.name) score += 15;
  if (this.bio) score += 15;
  if (this.skills && this.skills.length > 0) score += 25;
  if (this.resumeUrl) score += 25;
  this.profileCompletion = Math.min(score, 100);
  return this.profileCompletion;
};

const User = mongoose.model("User", userSchema);

export default User;
