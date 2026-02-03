import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || "development";
export const jwtSecret =
  process.env.JWT_SECRET || "fallback-secret-change-in-production";
export const jwtExpire = process.env.JWT_EXPIRE || "7d";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL || "admin@mutcu.ac.ke";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

const env = {
  port,
  nodeEnv,
  jwtSecret,
  jwtExpire,
  frontendUrl,
  databaseUrl,
  adminEmail,
  adminPassword,
};

export default env;
