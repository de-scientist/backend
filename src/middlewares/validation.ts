import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

/**
 * Middleware to validate request data using Zod schema
 */
const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Trim string values in body if they exist (before validation)
      if (req.body && typeof req.body === "object") {
        Object.keys(req.body).forEach((key) => {
          if (typeof req.body[key] === "string") {
            req.body[key] = req.body[key].trim();
          }
        });
      }

      // Debug logging in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Validation - Request body:",
          JSON.stringify(req.body, null, 2),
        );
      }

      // Validate the request
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update req.body with validated data (in case schema transforms it)
      if (result && result.body) {
        req.body = result.body;
      }

      // Validation passed, continue to next middleware
      next();
    } catch (error: any) {
      // Debug logging in development
      if (process.env.NODE_ENV === "development") {
        console.error("Validation error:", error.errors || error.issues);
        console.error(
          "Request body that failed:",
          JSON.stringify(req.body, null, 2),
        );
      }

      // Zod errors have an 'issues' array, not 'errors'
      const issues = error.issues || error.errors || [];
      const firstIssue = issues[0];
      const errorMessage =
        firstIssue?.message ||
        firstIssue?.path?.join(".") + " validation failed" ||
        "Validation error";

      return res.status(400).json({
        success: false,
        message: errorMessage,
        error: "Validation error",
        details: issues,
      });
    }
  };
};

export default validate;
