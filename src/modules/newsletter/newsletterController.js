const db = require("../../config/drizzle");
const { newsletterSubscriptions } = require("../../db/schema");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../../utils/response");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");
const { z } = require("zod");
const { eq } = require("drizzle-orm");

// Validation schemas
const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

/**
 * Subscribe to newsletter (public)
 */
const subscribe = async (req, res) => {
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
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const [subscription] = await db
      .update(newsletterSubscriptions)
      .set({ isActive: false })
      .where(eq(newsletterSubscriptions.email, email))
      .returning();

    return successResponse(res, subscription, "Unsubscribed successfully");
  } catch (error) {
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
const getSubscriptions = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { active } = req.query;

    const whereClauses = [];
    if (active === "true") {
      whereClauses.push(eq(newsletterSubscriptions.isActive, true));
    }

    const q = db.select().from(newsletterSubscriptions);
    const itemsQuery = whereClauses.length
      ? q
          .where(...whereClauses)
          .limit(limit)
          .offset(skip)
      : q.limit(limit).offset(skip);
    const subscriptions = await itemsQuery;
    const total = subscriptions.length;

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

module.exports = {
  subscribe,
  unsubscribe,
  getSubscriptions,
  subscribeSchema,
};
