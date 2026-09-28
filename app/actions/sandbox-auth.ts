"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { isDemoLoginEnabled } from "@/lib/auth/demo-mode";
import {
  DEMO_CLINIC_ID,
  DEMO_PERSONAS,
  type DemoRole,
} from "@/lib/auth/demo-personas";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";

type TestLogin = (args: { userId: string }) => Promise<{
  cookies: Array<{
    name: string;
    value: string;
    path?: string | null;
    httpOnly?: boolean | null;
    sameSite?: string | null;
    expires?: number | string | Date | null;
  }>;
}>;

export async function loginAsDemoPersona(role: DemoRole) {
  if (!isDemoLoginEnabled()) {
    throw new Error("Demo login disabled in production.");
  }

  const persona = DEMO_PERSONAS[role];
  if (!persona) {
    throw new Error(`Invalid demo persona: ${role}`);
  }

  // A demo login must never reach a non-demo clinic, even if the seeded
  // user row was reassigned. Fail closed when the row is missing too.
  const [personaRow] = await db
    .select({ clinicId: user.clinicId })
    .from(user)
    .where(eq(user.id, persona.userId));
  if (!personaRow || personaRow.clinicId !== DEMO_CLINIC_ID) {
    throw new Error("Demo persona is not assigned to the demo clinic.");
  }

  // getAuthPlugins() is conditional, so ctx.test is not in the inferred
  // type. Re-verify this cast after upgrading better-auth.
  const ctx = (await auth.$context) as Awaited<typeof auth.$context> & {
    test?: { login: TestLogin };
  };
  if (!ctx.test) {
    throw new Error("Better Auth testUtils plugin is not initialized.");
  }

  // Generate authentic DB-backed session & cryptographic token
  const { cookies: sessionCookies } = await ctx.test.login({
    userId: persona.userId,
  });

  // Apply Better Auth session cookies to the Next.js response headers
  const cookieStore = await cookies();
  for (const c of sessionCookies) {
    const rawExpires = c.expires;
    let expiresDate: Date | undefined;
    if (typeof rawExpires === "number") {
      // Convert Unix epoch timestamp from seconds to milliseconds if < 10 digits in ms
      expiresDate = new Date(rawExpires < 10000000000 ? rawExpires * 1000 : rawExpires);
    } else if (rawExpires) {
      expiresDate = new Date(rawExpires);
    } else {
      expiresDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    cookieStore.set(c.name, c.value, {
      path: c.path ?? "/",
      httpOnly: c.httpOnly ?? true,
      secure: (process.env.NODE_ENV as string) === "production",
      sameSite: (c.sameSite?.toLowerCase() as "lax" | "strict" | "none") || "lax",
      expires: expiresDate,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  }

  redirect("/dashboard");
}

export async function loginAsDoctorAction() {
  return loginAsDemoPersona("doctor");
}

export async function loginAsReceptionistAction() {
  return loginAsDemoPersona("receptionist");
}

export async function loginAsPersonaAction(role: DemoRole) {
  return loginAsDemoPersona(role);
}

export async function logoutSandboxAction() {
  try {
    const reqHeaders = await headers();
    await auth.api.signOut({ headers: reqHeaders });
  } catch {
    // If sign out API call fails or session is already absent, continue with cookie clearing
  }

  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("better-auth.session_data");

  redirect("/");
}
