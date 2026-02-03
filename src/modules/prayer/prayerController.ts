import { randomUUID } from "crypto";
import db from "../../config/drizzle.js";
import { prayerRequests } from "../../db/schema.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../utils/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../utils/pagination.js";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Request, Response } from "express";

// Validation schemas
export const createPrayerRequestSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    request: z.string().min(1, "Prayer request is required"),
    isPublic: z.boolean().optional(),
  }),
});

/**
 * Submit prayer request (public)
 */
export const createPrayerRequest = async (req: Request, res: Response) => {
  try {
    const { name, request, isPublic } = req.body;

    const [prayerRequest] = await db
      .insert(prayerRequests)
      .values({
        id: randomUUID(),
        name: name || null,
        request,
        isPublic: isPublic || false,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return successResponse(
      res,
      prayerRequest,
      "Prayer request submitted successfully",
      201,
    );
  } catch (error: any) {
    console.error("Create prayer request error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    });

    // Handle specific database errors
    if (error.code === "23505") {
      // Unique constraint violation
      return errorResponse(
        res,
        "A prayer request with this information already exists",
        409,
      );
    }
    if (error.code === "23502") {
      // Not null constraint violation
      const column = error.column || "unknown field";
      return errorResponse(res, `Missing required field: ${column}`, 400);
    }
    if (error.code === "42P01") {
      // Table does not exist
      return errorResponse(
        res,
        "Database table not found. Please run migrations.",
        500,
      );
    }

    return errorResponse(
      res,
      error.message || "Failed to submit prayer request",
      500,
    );
  }
};

/**
 * Get prayer requests (admin only)
 */
export const getPrayerRequests = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    // Build queries
    let requestsQuery = db.select().from(prayerRequests);
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(prayerRequests);

    if (status) {
      requestsQuery = requestsQuery.where(
        eq(prayerRequests.status, status as string),
      );
      countQuery = countQuery.where(
        eq(prayerRequests.status, status as string),
      );
    }

    // Execute queries in parallel
    const [requests, countResult] = await Promise.all([
      requestsQuery.limit(limit).offset(skip),
      countQuery,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const pagination = getPaginationMeta(total, page, limit);

    return paginatedResponse(
      res,
      requests,
      pagination,
      "Prayer requests retrieved successfully",
    );
  } catch (error) {
    console.error("Get prayer requests error:", error);
    return errorResponse(res, "Failed to retrieve prayer requests", 500);
  }
};

/**
 * Update prayer request status (admin only)
 */
export const updatePrayerRequestStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "PRAYED_FOR", "ANSWERED"].includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const updatedArr = await db
      .update(prayerRequests)
      .set({ status })
      .where(eq(prayerRequests.id, id))
      .returning();
    const prayerRequest = updatedArr[0];

    return successResponse(
      res,
      prayerRequest,
      "Prayer request status updated successfully",
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse(res, "Prayer request not found", 404);
    }
    console.error("Update prayer request error:", error);
    return errorResponse(res, "Failed to update prayer request", 500);
  }
};
