import type { Request } from "express";

/**
 * Pagination utility functions
 */
export const getPaginationParams = (query: Request["query"]) => {
  const page = Math.max(1, parseInt((query.page as string) || "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt((query.limit as string) || "10")),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number,
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
