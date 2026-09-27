import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database Client & Multi-Tenancy Architecture:
 *
 * - Access Model: Server-only direct PostgreSQL connection via Drizzle ORM.
 *   The browser never connects directly to Supabase PostgREST or issues client-level SQL.
 * - Row Level Security (RLS): Database tables enforce deny-all for anon and authenticated roles.
 * - Authorization Invariant: All clinical data queries and mutations must explicitly filter
 *   by `clinicId` derived from authenticated server sessions (getSession / requireDoctor).
 */

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
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

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL environment variable.");
}

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  directConn: postgres.Sql | undefined;
};

export const client =
  globalForDb.conn ??
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });

const directConnectionString = process.env.DIRECT_URL || connectionString;

export const directClient =
  globalForDb.directConn ??
  postgres(directConnectionString, {
    prepare: false,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.directConn = directClient;
}

export const directDb = drizzle(directClient, { schema });
