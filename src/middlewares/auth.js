const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const db = require("../config/drizzle");
const { users } = require("../db/schema");
const { eq } = require("drizzle-orm");

/**
 * Middleware to verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, jwtSecret);
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
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * Middleware to check if user is super admin
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  requireSuperAdmin,
};
