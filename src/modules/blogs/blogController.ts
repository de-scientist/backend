import { randomUUID } from "crypto";
import db from "../../config/drizzle.js";
import { blogs } from "../../db/schema.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../utils/response.js";
import {
  getPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import type { Request, Response } from "express";

const statusEnum = ["draft", "published"] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ensureUniqueSlug = async (base: string, excludeId?: string) => {
  let candidate = base;
  let suffix = 1;

  // Loop until we find a slug that does not exist (or matches excluded id)
  // This is intentionally simple to avoid adding DB uniqueness constraints.
  // The number of iterations should be very small in practice.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db
      .select({ id: blogs.id })
      .from(blogs)
      .where(
        excludeId
          ? and(eq(blogs.slug, candidate), sql`"blogs"."id" <> ${excludeId}`)
          : eq(blogs.slug, candidate),
      )
      .limit(1);

    if (!existing.length) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
};

// Validation schemas
export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title is required"),
    slug: z.string().optional(),
    excerpt: z
      .string()
      .max(400, "Excerpt is too long")
      .optional()
      .or(z.literal("")),
    content: z.string().min(10, "Content is required"),
    featuredImage: z
      .string()
      .url("Invalid image URL")
      .optional()
      .or(z.literal("")),
    author: z.string().optional().or(z.literal("")),
    status: z.enum(statusEnum).optional(),
    tags: z.string().optional().or(z.literal("")),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().optional(),
    excerpt: z.string().max(400).optional().or(z.literal("")),
    content: z.string().min(10).optional(),
    featuredImage: z
      .string()
      .url("Invalid image URL")
      .optional()
      .or(z.literal("")),
    author: z.string().optional().or(z.literal("")),
    status: z.enum(statusEnum).optional(),
    tags: z.string().optional().or(z.literal("")),
  }),
});

/**
 * Public: list published blogs with pagination and search
 */
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = (req.query.search as string | undefined)?.trim();

    const filters = [eq(blogs.status, "published")];

    if (search) {
      const likeTerm = `%${search}%`;
      filters.push(
        or(
          ilike(blogs.title, likeTerm),
          ilike(blogs.excerpt, likeTerm),
          ilike(blogs.tags, likeTerm),
        ),
      );
    }

    const whereClause = and(...filters);

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(blogs)
        .where(whereClause)
        .orderBy(desc(sql`COALESCE(${blogs.publishedAt}, ${blogs.createdAt})`))
        .limit(limit)
        .offset(skip),
      db
        .select({ count: sql<number>`count(*)` })
        .from(blogs)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const pagination = getPaginationMeta(total, page, limit);

    return paginatedResponse(
      res,
      data,
      pagination,
      "Blogs retrieved successfully",
    );
  } catch (error) {
    console.error("Get blogs error:", error);
    return errorResponse(res, "Failed to retrieve blogs", 500);
  }
};

/**
 * Public: get a single published blog by slug
 */
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await db
      .select()
      .from(blogs)
      .where(and(eq(blogs.slug, slug), eq(blogs.status, "published")))
      .limit(1);

    const blog = result[0];
    if (!blog) {
      return errorResponse(res, "Blog not found", 404);
    }

    return successResponse(res, blog, "Blog retrieved successfully");
  } catch (error) {
    console.error("Get blog error:", error);
    return errorResponse(res, "Failed to retrieve blog", 500);
  }
};

/**
 * Admin: list all blogs (with filters)
 */
export const adminGetBlogs = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = (req.query.search as string | undefined)?.trim();
    const statusFilter = (
      req.query.status as string | undefined
    )?.toLowerCase();

    const filters = [];

    if (statusFilter && statusEnum.includes(statusFilter as any)) {
      filters.push(eq(blogs.status, statusFilter));
    }

    if (search) {
      const likeTerm = `%${search}%`;
      filters.push(
        or(
          ilike(blogs.title, likeTerm),
          ilike(blogs.excerpt, likeTerm),
          ilike(blogs.tags, likeTerm),
        ),
      );
    }

    const whereClause = filters.length ? and(...filters) : undefined;

    const listQuery = db
      .select()
      .from(blogs)
      .orderBy(desc(sql`COALESCE(${blogs.updatedAt}, ${blogs.createdAt})`))
      .limit(limit)
      .offset(skip);

    const countQuery = db.select({ count: sql<number>`count(*)` }).from(blogs);

    const [data, countResult] = await Promise.all([
      whereClause ? listQuery.where(whereClause) : listQuery,
      whereClause ? countQuery.where(whereClause) : countQuery,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const pagination = getPaginationMeta(total, page, limit);

    return paginatedResponse(
      res,
      data,
      pagination,
      "Blogs retrieved successfully",
    );
  } catch (error) {
    console.error("Admin get blogs error:", error);
    return errorResponse(res, "Failed to retrieve blogs", 500);
  }
};

/**
 * Admin: create blog
 */
export const createBlog = async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      status = "draft",
      tags,
    } = req.body;

    const baseSlug = slugify(slug || title);
    const finalSlug = await ensureUniqueSlug(baseSlug);
    const publishedAt = status === "published" ? new Date() : null;

    const [created] = await db
      .insert(blogs)
      .values({
        id: randomUUID(),
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        featuredImage: featuredImage || null,
        author: author || null,
        status,
        tags: tags || null,
        publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return successResponse(res, created, "Blog created successfully", 201);
  } catch (error: any) {
    console.error("Create blog error:", error);
    return errorResponse(res, error.message || "Failed to create blog", 500);
  }
};

/**
 * Admin: update blog
 */
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, status, ...rest } = req.body;

    const updateData: any = { ...rest };

    if (title) {
      updateData.title = title;
    }

    if (slug || title) {
      const baseSlug = slugify(slug || title);
      updateData.slug = await ensureUniqueSlug(baseSlug, id);
    }

    if (status) {
      updateData.status = status;
      if (status === "published") {
        updateData.publishedAt = updateData.publishedAt || new Date();
      } else {
        updateData.publishedAt = null;
      }
    }

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(blogs)
      .set(updateData)
      .where(eq(blogs.id, id))
      .returning();

    if (!updated) {
      return errorResponse(res, "Blog not found", 404);
    }

    return successResponse(res, updated, "Blog updated successfully");
  } catch (error: any) {
    console.error("Update blog error:", error);
    return errorResponse(res, error.message || "Failed to update blog", 500);
  }
};

/**
 * Admin: delete blog
 */
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(blogs)
      .where(eq(blogs.id, id))
      .returning();
    if (!deleted) {
      return errorResponse(res, "Blog not found", 404);
    }

    return successResponse(res, null, "Blog deleted successfully");
  } catch (error) {
    console.error("Delete blog error:", error);
    return errorResponse(res, "Failed to delete blog", 500);
  }
};
