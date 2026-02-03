import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// ─────────────────────────────────────────────
// Environment validation (fail fast)
// ─────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined");
}

// ─────────────────────────────────────────────
// Connection pool configuration
// ─────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Supabase / hosted PG
  },

  // Production-tuned pool settings
  max: 10,               // max connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// ─────────────────────────────────────────────
// Drizzle instance
// ─────────────────────────────────────────────
export const db = drizzle(pool);

// ─────────────────────────────────────────────
// Graceful shutdown (very important in prod)
// ─────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`⚠️ Received ${signal}. Closing DB pool...`);
  try {
    await pool.end();
    console.log("✅ Database pool closed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during DB shutdown", err);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", shutdown);
process.on("unhandledRejection", shutdown);

export { pool };
export default db;
