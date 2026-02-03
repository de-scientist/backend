import dotenv from "dotenv";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool);
export { pool };

process.on("beforeExit", async () => {
  await pool.end();
});

export default db;
