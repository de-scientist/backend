const db = require("../../config/drizzle");
const { events } = require("../../db/schema");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../../utils/response");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");
const { eq } = require("drizzle-orm");
const { z } = require("zod");

// Validation schemas
const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    date: z.string().datetime("Invalid date format"),
    time: z.string().optional(),
    location: z.string().optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
  }),
});

const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    date: z.string().datetime().optional(),
    time: z.string().optional(),
    location: z.string().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Get all events (public)
 */
const getEvents = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { active } = req.query;

    const whereClauses = [];
    if (active === "true") {
      whereClauses.push(eq(events.isActive, true));
    }

    const q = db.select().from(events);
    const itemsQuery = whereClauses.length
      ? q
          .where(...whereClauses)
          .limit(limit)
          .offset(skip)
      : q.limit(limit).offset(skip);
    const eventsList = await itemsQuery;
    const total = eventsList.length;

    const pagination = getPaginationMeta(total, page, limit);

    return paginatedResponse(
      res,
      eventsList,
      pagination,
      "Events retrieved successfully",
    );
  } catch (error) {
    console.error("Get events error:", error);
    return errorResponse(res, "Failed to retrieve events", 500);
  }
};

/**
 * Get single event
 */
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const arr = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    const event = arr[0];

    if (!event) {
      return errorResponse(res, "Event not found", 404);
    }

    return successResponse(res, event, "Event retrieved successfully");
  } catch (error) {
    console.error("Get event error:", error);
    return errorResponse(res, "Failed to retrieve event", 500);
  }
};

/**
 * Create event (admin only)
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, imageUrl } = req.body;

    const [event] = await db
      .insert(events)
      .values({
        title,
        description,
        date: new Date(date),
        time,
        location,
        imageUrl,
      })
      .returning();

    return successResponse(res, event, "Event created successfully", 201);
  } catch (error) {
    console.error("Create event error:", error);
    return errorResponse(res, "Failed to create event", 500);
  }
};

/**
 * Update event (admin only)
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedArr = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    const event = updatedArr[0];

    return successResponse(res, event, "Event updated successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Event not found", 404);
    }
    console.error("Update event error:", error);
    return errorResponse(res, "Failed to update event", 500);
  }
};

/**
 * Delete event (admin only)
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(events).where(eq(events.id, id)).returning();

    return successResponse(res, null, "Event deleted successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Event not found", 404);
    }
    console.error("Delete event error:", error);
    return errorResponse(res, "Failed to delete event", 500);
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  createEventSchema,
  updateEventSchema,
};
