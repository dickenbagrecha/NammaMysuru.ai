import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations-pg",
  schema: "./shared/schema.pg.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL || "",
  },
});
