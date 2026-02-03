import db from "../../config/drizzle.js";
import { resources } from "../../db/schema.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

/* =======================
   PUBLIC
======================= */
export const getResources = async (_req: Request, res: Response) => {
  try {
    const data = await db
      .select()
      .from(resources)
      .where(eq(resources.isActive, true))
      .orderBy(resources.createdAt);

    return successResponse(res, data, "Resources retrieved successfully");
  } catch (err) {
    console.error(err);
    return successResponse(res, [], "Resources retrieved successfully");
  }
};

/* =======================
   ADMIN
======================= */
export const getAllResourcesAdmin = async (_req: Request, res: Response) => {
  const data = await db.select().from(resources);
  return successResponse(res, data);
};

export const createResource = async (req: Request, res: Response) => {
  try {
    const [created] = await db.insert(resources).values(req.body).returning();

    return successResponse(res, created, "Resource created");
  } catch (err) {
    return errorResponse(res, "Failed to create resource");
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(resources)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(resources.id, req.params.id))
      .returning();

    return successResponse(res, updated, "Resource updated");
  } catch {
    return errorResponse(res, "Failed to update resource");
  }
};

export const toggleResource = async (req: Request, res: Response) => {
  const [resource] = await db
    .select()
    .from(resources)
    .where(eq(resources.id, req.params.id));

  if (!resource) return errorResponse(res, "Not found");

  const [updated] = await db
    .update(resources)
    .set({ isActive: !resource.isActive })
    .where(eq(resources.id, req.params.id))
    .returning();

  return successResponse(res, updated, "Visibility updated");
};

export const deleteResource = async (req: Request, res: Response) => {
  await db.delete(resources).where(eq(resources.id, req.params.id));
  return successResponse(res, null, "Resource deleted");
};
