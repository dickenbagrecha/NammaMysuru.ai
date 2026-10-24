import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.pg";

const { Pool } = pg;

/**
 * Creates and exports a PostgreSQL connection pool and Drizzle client.
 * Uses DATABASE_URL from process.env.
 * Note: SSL is enabled with rejectUnauthorized: false by default for managed providers like Neon.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required to initialize PostgreSQL database connection."
  );
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" || connectionString.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
});

export const dbPg = drizzle(pool, { schema });
