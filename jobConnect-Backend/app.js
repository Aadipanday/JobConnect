import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import jobRoutes from "./routes/job.route.js";
import recruiterRoutes from "./routes/recruiter.route.js";
import candidateRoutes from "./routes/candidate.route.js";
import adminRoutes from "./routes/admin.route.js";
import applicationRoutes from "./routes/application.route.js";

import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { ApiResponse } from "./utils/ApiResponse.js";

const app = express();

// Security HTTP headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
  })
);

// Body and Cookie parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Rate limiter for auth endpoints (brute-force defense)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per window
  message: {
    statusCode: 429,
    success: false,
    message: "Too many authentication requests, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route Mounts
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/application", applicationRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "healthy",
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date().toISOString(),
        database: dbStatus,
      },
      "JobConnect API is healthy and operational"
    )
  );
});

// Root route
app.get("/", (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        version: "1.0.0",
        mode: process.env.NODE_ENV || "development",
        health: "/api/health",
      },
      "Welcome to JobConnect API (Production Mode)"
    )
  );
});

// 404 & Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;