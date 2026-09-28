/**
 * Demo-database reset: truncate all app tables and re-run the seed.
 *
 * GUARDED — refuses to run unless ALL of the following hold:
 *   1. DEMO_MODE is exactly "true" (see lib/auth/demo-mode.ts).
 *   2. The caller passes --confirm=<ref>, where <ref> is the Supabase
 *      project ref parsed from the target connection string
 *      (username "postgres.<ref>" or host "db.<ref>.supabase.co").
 *      If no ref can be parsed, --confirm=<host>/<username> is required.
 *
 * The script NEVER prints credentials — only host, username and ref.
 *
 * Usage: pnpm db:reset-demo -- --confirm=<ref>
 */
import { sql, is, getTableName } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { client, db } from "../lib/db/client";
import * as appSchema from "../lib/db/schema";
import * as authSchema from "../lib/db/auth-schema";
import { isDemoResetAllowed } from "../lib/auth/demo-mode";
import { seed } from "../lib/db/seed";

export interface ConfirmTarget {
  host: string;
  username: string;
  ref: string | null;
  /** The exact --confirm=<value> suffix the caller must pass. */
  expectedConfirm: string;
}

/**
 * Derive the human-safe identity of a Postgres connection string.
 * Returns host/username/ref only — the password is never exposed.
 */
export function parseConfirmTarget(connectionString: string): ConfirmTarget {
  const url = new URL(connectionString);
  const host = url.hostname;
  // new URL percent-decodes username; never touch url.password.
  const username = decodeURIComponent(url.username);

  let ref: string | null = null;
  const userMatch = /^postgres\.(.+)$/.exec(username);
  if (userMatch?.[1]) {
    ref = userMatch[1];
  } else {
    const hostMatch = /^db\.(.+)\.supabase\.co$/.exec(host);
    if (hostMatch?.[1]) ref = hostMatch[1];
  }

  return {
    host,
    username,
    ref,
    expectedConfirm: ref ?? `${host}/${username}`,
  };
}

/**
 * Discover every app table from the Drizzle schema objects.
 * The drizzle migrations journal (__drizzle_migrations) is not a schema
 * object and is excluded by construction; enum/relation exports are
 * filtered out by the PgTable check.
 */
export function discoverTableNames(): string[] {
  const names = new Set<string>();
  for (const mod of [appSchema, authSchema]) {
    for (const value of Object.values(mod)) {
      if (is(value, PgTable)) names.add(getTableName(value));
    }
  }
  return [...names]
    .filter((name) => name !== "__drizzle_migrations")
    .sort();
}

async function main() {
  if (!isDemoResetAllowed()) {
    console.error(
      "Refusing to reset: DEMO_MODE is not exactly \"true\". " +
        "This script must only run against a seed-only demo database."
    );
    process.exit(1);
  }

  // Same resolution order as lib/db/client.ts.
  const connectionString =
    process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) {
    console.error("Refusing to reset: no DATABASE_URL or DIRECT_URL set.");
    process.exit(1);
  }

  let target: ConfirmTarget;
  try {
    target = parseConfirmTarget(connectionString);
  } catch {
    console.error(
      "Refusing to reset: the database connection string could not be parsed."
    );
    process.exit(1);
  }

  console.log(`Target database host: ${target.host}`);
  console.log(`Target database user: ${target.username}`);
  console.log(
    target.ref
      ? `Target Supabase project ref: ${target.ref}`
      : "No Supabase project ref could be parsed."
  );

  const confirmArg = process.argv.find((a) => a.startsWith("--confirm="));
  if (confirmArg !== `--confirm=${target.expectedConfirm}`) {
    console.error(
      `Refusing to reset: pass --confirm=${target.expectedConfirm} to proceed.`
    );
    process.exit(1);
  }

  const tables = discoverTableNames();
  console.log(`Truncating ${tables.length} tables...`);
  await db.execute(
    sql`TRUNCATE ${sql.raw(tables.map((t) => `"${t}"`).join(", "))} CASCADE`
  );

  await seed();
  console.log("✅ Demo reset completed successfully!");
}

const invokedDirectly =
  process.argv[1] && process.argv[1].endsWith("reset-demo.ts");
if (invokedDirectly) {
  main()
    .then(async () => {
      await client.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Demo reset failed:", err);
      await client.end();
      process.exit(1);
    });
}
