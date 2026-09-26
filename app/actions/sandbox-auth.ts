"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DEMO_PERSONAS, type DemoRole } from "@/lib/auth/demo-personas";

export async function loginAsDemoPersona(role: DemoRole) {
  const persona = DEMO_PERSONAS[role];
  if (!persona) {
    throw new Error(`Invalid demo persona: ${role}`);
  }

  const ctx = await auth.$context;
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
      secure: process.env.NODE_ENV === "production",
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
