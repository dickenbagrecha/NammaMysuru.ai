import { dbPg, pool } from "./db.pg";

// Re-export PostgreSQL drizzle client as canonical 'db' and connection pool
export const db = dbPg;
export { pool };
