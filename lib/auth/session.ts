import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export type UserRole = "doctor" | "receptionist";

export interface SessionContext {
  user: {
    id: string;
    name: string;
    email: string;
  };
  clinicId: string;
  role: UserRole;
}

export async function getSession(): Promise<SessionContext> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & {
    clinicId?: string | null;
    role?: string | null;
  };

  if (!user.clinicId) {
    redirect("/login/not-set-up");
  }

  if (user.role !== "doctor" && user.role !== "receptionist") {
    redirect("/login/not-set-up");
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    clinicId: user.clinicId,
    role: user.role,
  };
}

/**
 * Resolves the session if present and valid; returns null if not logged in
 * or not assigned to a clinic/valid role.
 * Does NOT redirect, making it safe for public/landing routes per ARCH §3.
 */
export async function getOptionalSession(): Promise<SessionContext | null> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user) {
      return null;
    }

    const user = session.user as typeof session.user & {
      clinicId?: string | null;
      role?: string | null;
    };

    if (!user.clinicId) {
      return null;
    }

    if (user.role !== "doctor" && user.role !== "receptionist") {
      return null;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      clinicId: user.clinicId,
      role: user.role,
    };
  } catch {
    return null;
  }
}
