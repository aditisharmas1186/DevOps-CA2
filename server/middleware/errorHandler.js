import mongoose from "mongoose";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // MongoDB Validation Errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // MongoDB Duplicate Key Error
  if (err.name === "MongoError" && err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate data found",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // JWT Authentication Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Authentication token expired",
    });
  }

  // OpenAI API Errors
  if (err.code === "insufficient_quota") {
    return res.status(503).json({
      message: "AI service temporarily unavailable",
      details: "API quota exceeded",
    });
  }

  // File Upload Errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File too large",
      details: "Maximum file size is 10MB",
    });
  }

  // Default Error Response
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
};
