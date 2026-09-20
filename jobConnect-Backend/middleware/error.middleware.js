import { ApiError } from "../utils/ApiError.js";

/**
 * 404 Not Found Middleware
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

/**
 * Centralized Production Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
    let errors = [];

    // Mongoose Bad ObjectId (CastError)
    if (error.name === "CastError") {
      statusCode = 400;
      message = `Resource not found with id: ${error.value}`;
    }

    // Mongoose Duplicate Key Error (E11000)
    if (error.code === 11000) {
      statusCode = 400;
      const field = Object.keys(error.keyValue || {})[0] || "field";
      message = `Duplicate value entered for ${field}. Please use another value.`;
    }

    // Mongoose Validation Error
    if (error.name === "ValidationError") {
      statusCode = 400;
      errors = Object.values(error.errors).map((val) => val.message);
      message = errors.join(", ");
    }

    // JWT Token Errors
    if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token. Please authenticate again.";
    }
    if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token has expired. Please log in again.";
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors,
    data: null,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { ApiError };
