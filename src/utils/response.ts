import type { Response } from "express";

/**
 * Standardized API response helpers
 */
export const successResponse = (
  res: Response,
  data: any,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message = "Error",
  statusCode = 400,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const paginatedResponse = (
  res: Response,
  data: any,
  pagination: any,
  message = "Success",
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};
