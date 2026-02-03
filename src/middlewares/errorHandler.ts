import type { Request, Response, NextFunction } from "express";
import type { ZodError } from "zod";

interface ErrorWithCode extends Error {
  code?: string;
  statusCode?: number;
  name?: string;
}

/**
 * Centralized error handling middleware
 */
export default (
  err: ErrorWithCode,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Not found",
      message: "The requested record was not found",
    });
  }

  // Validation errors
  if (err.name === "ZodError") {
    const zodError = err as unknown as ZodError;
    return res.status(400).json({
      error: "Validation error",
      details: zodError.errors,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
