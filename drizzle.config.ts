import { defineConfig } from "drizzle-kit";

if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // ignore
  }
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // ignore
  }
}

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL in environment");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
});
