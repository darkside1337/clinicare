import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { testUtils } from "better-auth/plugins";
import { db } from "@/lib/db/client";

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
  plugins:
    process.env.NODE_ENV === "production"
      ? [nextCookies()]
      : [nextCookies(), testUtils()],
});

export type Auth = typeof auth;

