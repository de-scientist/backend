import { randomUUID } from "crypto";
import db from "../../config/drizzle.js";
import { members } from "../../db/schema.js";
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
export const registerMemberSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    yearOfStudy: z.string().min(1, "Year of study is required"),
    course: z.string().min(1, "Course is required"),
    ministry1: z.string().optional().or(z.literal("")),
    ministry2: z.string().optional().or(z.literal("")),
    message: z.string().optional().or(z.literal("")),
  }),
});

/**
 * Register a new member (public)
 */
export const registerMember = async (req: Request, res: Response) => {
  try {
    const { name, email, yearOfStudy, course, ministry1, ministry2, message } =
      req.body;

    // Check if member with this email already exists
    const existingArr = await db
      .select()
      .from(members)
      .where(eq(members.email, email.trim()))
      .limit(1);
    const existingMember = existingArr[0];

    if (existingMember) {
      return errorResponse(
        res,
        "A member with this email has already registered",
        409,
      );
    }

    // Create member registration
    const [member] = await db
      .insert(members)
      .values({
        id: randomUUID(),
        name: name.trim(),
        email: email.trim(),
        yearOfStudy: yearOfStudy.trim(),
        course: course.trim(),
        ministry1: ministry1?.trim() || null,
        ministry2: ministry2?.trim() || null,
        message: message?.trim() || null,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return successResponse(
      res,
      member,
      "Member registration submitted successfully. We will review your application soon.",
      201,
    );
  } catch (error: any) {
    console.error("Register member error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });

    if (error.code === "23505") {
      // Unique constraint violation
      return errorResponse(
        res,
        "A member with this email has already registered",
        409,
      );
    }
    if (error.code === "23502") {
      // Not null constraint violation
      const column = error.column || "unknown field";
      return errorResponse(res, `Missing required field: ${column}`, 400);
    }

    return errorResponse(
      res,
      error.message || "Failed to submit member registration",
      500,
    );
  }
};

/**
 * Get all member registrations (admin only)
 */
export const getMembers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    // Build queries
    let membersQuery = db.select().from(members);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(members);

    if (status) {
      membersQuery = membersQuery.where(eq(members.status, status as string));
      countQuery = countQuery.where(eq(members.status, status as string));
    }

    // Execute queries in parallel
    const [membersList, countResult] = await Promise.all([
      membersQuery.limit(limit).offset(skip).orderBy(members.createdAt),
      countQuery,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const pagination = getPaginationMeta(total, page, limit);

    return paginatedResponse(
      res,
      membersList,
      pagination,
      "Members retrieved successfully",
    );
  } catch (error) {
    console.error("Get members error:", error);
    return errorResponse(res, "Failed to retrieve members", 500);
  }
};

/**
 * Update member status (admin only)
 */
export const updateMemberStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return errorResponse(
        res,
        "Invalid status. Must be PENDING, APPROVED, or REJECTED",
        400,
      );
    }

    const updatedArr = await db
      .update(members)
      .set({ status, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();

    const member = updatedArr[0];

    if (!member) {
      return errorResponse(res, "Member not found", 404);
    }

    return successResponse(res, member, "Member status updated successfully");
  } catch (error: any) {
    console.error("Update member status error:", error);
    return errorResponse(
      res,
      error.message || "Failed to update member status",
      500,
    );
  }
};
