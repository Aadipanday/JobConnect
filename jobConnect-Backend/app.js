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
import { ApiError } from "./utils/ApiError.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// 1. Trust Reverse Proxy (Mandatory for HTTPS on Render, AWS ALB, Heroku, Vercel, Nginx, Cloudflare)
app.set("trust proxy", 1);

// 2. Strict HTTPS Redirection Middleware in Production
if (isProduction) {
  app.use((req, res, next) => {
    const proto = req.header("x-forwarded-proto");
    if (proto && proto !== "https") {
      return res.redirect(301, `https://${req.header("host")}${req.originalUrl}`);
    }
    next();
  });
}

// 3. Security HTTP Headers with HSTS (Strict-Transport-Security)
app.use(
  helmet({
    hsts: isProduction
      ? {
          maxAge: 31536000, // 1 year in seconds
          includeSubDomains: true,
          preload: true,
        }
      : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProduction ? undefined : false,
  })
);

// 4. Request Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(isProduction ? "combined" : "dev"));
}

// 5. Robust CORS Configuration for HTTPS Deployments
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

const allowedOrigins = [...configuredOrigins, ...defaultDevOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Match explicit allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, permit localhost ports dynamically
      if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Check if origin matches any configured prefix (e.g. preview deployment subdomains)
      const isAllowedPrefix = configuredOrigins.some((allowed) =>
        origin.startsWith(allowed)
      );
      if (isAllowedPrefix) {
        return callback(null, true);
      }

      return callback(
        new ApiError(403, `CORS policy blocked access from origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// 6. Parsers (JSON, URL-encoded, Cookies)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// 7. Rate Limiter for Auth Routes (DDoS & Brute-force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    success: false,
    message: "Too many authentication requests from this IP, please try again after 15 minutes",
  },
});

// 8. Route Mounts
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/application", applicationRoutes);

// 9. Production-Grade Health & Diagnostics Endpoint
app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  return res.status(isDbConnected ? 200 : 503).json(
    new ApiResponse(
      isDbConnected ? 200 : 503,
      {
        status: isDbConnected ? "healthy" : "degraded",
        protocol: req.secure || req.header("x-forwarded-proto") === "https" ? "https" : "http",
        environment: process.env.NODE_ENV || "development",
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date().toISOString(),
        database: isDbConnected ? "connected" : "disconnected",
      },
      isDbConnected
        ? "JobConnect API is healthy and operational"
        : "Database connection failed"
    )
  );
});

// 10. Root Welcome Endpoint
app.get("/", (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        name: "JobConnect API",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        secure: req.secure || req.header("x-forwarded-proto") === "https",
        health: "/api/health",
      },
      "Welcome to JobConnect API (Production & HTTPS Ready)"
    )
  );
});

// 11. Centralized 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;