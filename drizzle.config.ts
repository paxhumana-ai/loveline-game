import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// .env 파일을 먼저 로드하고, 없으면 .env 파일을 로드
dotenv.config({ path: ".env" });
dotenv.config();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
  // schemaFilter: ["public", "auth"],
  // Add Supabase role management
  entities: {
    roles: {
      provider: "supabase",
      exclude: ["new_supabase_role"],
    },
  },
  // Enable strict mode for safety
  strict: true,
  // Add statement breakpoints for better migration handling
  breakpoints: true,
  // Enable verbose mode for better debugging
  verbose: true,
  // Configure migrations table
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
  },
});
