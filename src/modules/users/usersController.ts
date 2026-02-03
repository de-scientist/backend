import bcrypt from "bcryptjs";
import db from "../../config/drizzle.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../utils/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../utils/pagination.js";
import { sql } from "drizzle-orm";
import type { Request, Response } from "express";

/**
 * List users (admin)
 */
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const totalRes: any = await db.select({ count: sql`count(*)` }).from(users);
    const total = Number(totalRes[0]?.count || 0);

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .limit(limit)
      .offset(skip);

    const meta = getPaginationMeta(total, page, limit);

    return paginatedResponse(res, rows, meta, "Users retrieved successfully");
  } catch (error) {
    console.error("List users error:", error);
    return errorResponse(res, "Failed to retrieve users", 500);
  }
};

/**
 * Get single user by id (admin)
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usersArr = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    const user = usersArr[0];
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user, "User retrieved successfully");
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse(res, "Failed to retrieve user", 500);
  }
};

/**
 * Update user (admin)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, isActive, password } = req.body as any;

    const updateValues: any = {};
    if (name !== undefined) updateValues.name = name;
    if (role !== undefined) updateValues.role = role;
    if (isActive !== undefined) updateValues.isActive = isActive;
    if (password) updateValues.password = await bcrypt.hash(password, 10);

    const [user] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, user, "User updated successfully");
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse(res, "Failed to update user", 500);
  }
};

/**
 * Deactivate user (admin)
 */
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [user] = await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
      });
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user, "User deactivated successfully");
  } catch (error) {
    console.error("Deactivate user error:", error);
    return errorResponse(res, "Failed to deactivate user", 500);
  }
};
