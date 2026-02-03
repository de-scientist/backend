import { randomUUID } from "crypto";
import db from "../../config/drizzle.js";
import { events } from "../../db/schema.js";
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
export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().or(z.literal("")),
    date: z.string().refine(
      (val) => {
        if (!val) return false;
        // Accept ISO datetime strings (with or without timezone, with or without seconds)
        // Also accept datetime-local format from HTML input (YYYY-MM-DDTHH:mm)
        const isoRegex =
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return (
          isoRegex.test(val) || dateRegex.test(val) || !isNaN(Date.parse(val))
        );
      },
      {
        message:
          "Invalid date format. Expected format: YYYY-MM-DDTHH:mm or YYYY-MM-DD",
      },
    ),
    time: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    imageUrl: z
      .union([z.string().url("Invalid image URL"), z.literal("")])
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().or(z.literal("")),
    date: z
      .string()
      .refine(
        (val) => {
          if (!val) return true; // Optional field, allow empty
          // Accept ISO datetime strings (with or without timezone, with or without seconds)
          // Also accept datetime-local format from HTML input (YYYY-MM-DDTHH:mm)
          const isoRegex =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          return (
            isoRegex.test(val) || dateRegex.test(val) || !isNaN(Date.parse(val))
          );
        },
        {
          message:
            "Invalid date format. Expected format: YYYY-MM-DDTHH:mm or YYYY-MM-DD",
        },
      )
      .optional(),
    time: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    imageUrl: z
      .union([z.string().url("Invalid image URL"), z.literal("")])
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Get all events (public)
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { active } = req.query;

    // Build base query
    let eventsQuery = db.select().from(events);

    // Apply filters
    if (active === "true") {
      eventsQuery = eventsQuery.where(eq(events.isActive, true));
    }

    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(events);
    if (active === "true") {
      countQuery = countQuery.where(eq(events.isActive, true));
    }

    // Execute queries in parallel
    const [eventsList, countResult] = await Promise.all([
      eventsQuery.limit(limit).offset(skip),
      countQuery,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
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
export const getEvent = async (req: Request, res: Response) => {
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
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, time, location, imageUrl, isActive } =
      req.body;

    const [event] = await db
      .insert(events)
      .values({
        id: randomUUID(),
        title,
        description: description || null,
        date: new Date(date),
        time: time || null,
        location: location || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return successResponse(res, event, "Event created successfully", 201);
  } catch (error: any) {
    console.error("Create event error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    return errorResponse(res, error.message || "Failed to create event", 500);
  }
};

/**
 * Update event (admin only)
 */
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

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
  } catch (error: any) {
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
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    return successResponse(res, null, "Event deleted successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse(res, "Event not found", 404);
    }
    console.error("Delete event error:", error);
    return errorResponse(res, "Failed to delete event", 500);
  }
};
