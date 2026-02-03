import db from "../../config/drizzle.js";
import { newsletterSubscriptions } from "../../db/schema.js";
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
export const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

/**
 * Subscribe to newsletter (public)
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existingArr = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1);
    const existing = existingArr[0];

    if (existing) {
      if (existing.isActive) {
        return errorResponse(res, "Email already subscribed", 409);
      } else {
        // Reactivate subscription
        const [subscription] = await db
          .update(newsletterSubscriptions)
          .set({ isActive: true })
          .where(eq(newsletterSubscriptions.email, email))
          .returning();
        return successResponse(
          res,
          subscription,
          "Subscription reactivated successfully",
        );
      }
    }

    // Create new subscription
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values({ email, isActive: true })
      .returning();

    return successResponse(res, subscription, "Subscribed successfully", 201);
  } catch (error) {
    console.error("Subscribe error:", error);
    return errorResponse(res, "Failed to subscribe", 500);
  }
};

/**
 * Unsubscribe from newsletter (public)
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [subscription] = await db
      .update(newsletterSubscriptions)
      .set({ isActive: false })
      .where(eq(newsletterSubscriptions.email, email))
      .returning();

    return successResponse(res, subscription, "Unsubscribed successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse(res, "Email not found", 404);
    }
    console.error("Unsubscribe error:", error);
    return errorResponse(res, "Failed to unsubscribe", 500);
  }
};

/**
 * Get all subscriptions (admin only)
 */
export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { active } = req.query;

    // Build queries
    let subscriptionsQuery = db.select().from(newsletterSubscriptions);
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscriptions);

    if (active === "true") {
      subscriptionsQuery = subscriptionsQuery.where(
        eq(newsletterSubscriptions.isActive, true),
      );
      countQuery = countQuery.where(eq(newsletterSubscriptions.isActive, true));
    }

    // Execute queries in parallel
    const [subscriptions, countResult] = await Promise.all([
      subscriptionsQuery.limit(limit).offset(skip),
      countQuery,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const pagination = getPaginationMeta(total, page, limit);

    return paginatedResponse(
      res,
      subscriptions,
      pagination,
      "Subscriptions retrieved successfully",
    );
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return errorResponse(res, "Failed to retrieve subscriptions", 500);
  }
};
