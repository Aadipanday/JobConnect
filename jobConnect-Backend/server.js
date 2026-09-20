import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./config/db.js";
import app from "./app.js";

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[JobConnect Server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`[UNHANDLED REJECTION] ${err.name}: ${err.message}`);
  // Log stack in development
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`[UNCAUGHT EXCEPTION] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }
  process.exit(1);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[JobConnect Server] Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log("[JobConnect Server] HTTP server closed.");
    try {
      await mongoose.connection.close(false);
      console.log("[JobConnect Server] MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("[JobConnect Server] Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default server;