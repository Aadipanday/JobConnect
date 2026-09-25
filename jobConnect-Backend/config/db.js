import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("[FATAL ERROR] MONGO_URI is not defined in environment variables!");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections for production throughput
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`[JobConnect MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[JobConnect MongoDB ERROR] Connection failed: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error(`[JobConnect MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[JobConnect MongoDB] Disconnected from database. Attempting reconnect...");
  });
};

export default connectDB;
