import db from "../../config/drizzle.js";
import { media } from "../../db/schema.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

/* =======================
   PUBLIC
======================= */
export const getGallery = async (_req: Request, res: Response) => {
  try {
    const data = await db
      .select()
      .from(media)
      .where(eq(media.isActive, true))
      .orderBy(media.createdAt);
    return successResponse(res, data, "Gallery retrieved successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to retrieve gallery");
  }
};

/* =======================
   ADMIN
======================= */
export const getAllGalleryAdmin = async (_req: Request, res: Response) => {
  const data = await db.select().from(media).orderBy(media.createdAt);
  return successResponse(res, data);
};

export const createGalleryItem = async (req: Request, res: Response) => {
  try {
    const { title, imageUrl } = req.body;

    if (!title || !imageUrl) {
      return errorResponse(res, "Title and imageUrl are required", 400);
    }

    const [created] = await db.insert(media).values(req.body).returning();

    return successResponse(res, created, "Gallery item created");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create gallery item");
  }
};

export const updateGalleryItem = async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(media)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(media.id, req.params.id))
      .returning();
    return successResponse(res, updated, "Gallery item updated");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to update gallery item");
  }
};

export const toggleGalleryItem = async (req: Request, res: Response) => {
  const [item] = await db
    .select()
    .from(media)
    .where(eq(media.id, req.params.id));
  if (!item) return errorResponse(res, "Gallery item not found");
  const [updated] = await db
    .update(media)
    .set({ isActive: !item.isActive })
    .where(eq(media.id, req.params.id))
    .returning();
  return successResponse(res, updated, "Gallery visibility updated");
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
  await db.delete(media).where(eq(media.id, req.params.id));
  return successResponse(res, null, "Gallery item deleted");
};
