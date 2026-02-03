import jwt from "jsonwebtoken";
import env from "../config/env.js";
import db from "../config/drizzle.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
  };
}

/**
 * Middleware to verify JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    const usersArr = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    const user = usersArr[0];

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive user" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
};

export type { AuthRequest };
