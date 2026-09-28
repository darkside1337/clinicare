import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { testUtils } from "better-auth/plugins";
import { db } from "@/lib/db/client";
import { isDemoLoginEnabled } from "@/lib/auth/demo-mode";

/**
 * testUtils exposes privileged ctx.test helpers (login, save/delete user)
 * but registers no HTTP endpoints. It is only included when demo login is
 * enabled, so production without DEMO_MODE=true has no demo-login path.
 */
export function getAuthPlugins() {
  return isDemoLoginEnabled() ? [nextCookies(), testUtils()] : [nextCookies()];
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    // input: false is enforced by Better Auth's parseInputData; re-verify after upgrading better-auth.
    additionalFields: {
      clinicId: {
        type: "string",
        required: false,
        input: false,
      },
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "receptionist",
      },
    },
  },
  plugins: getAuthPlugins(),
});

export type Auth = typeof auth;

