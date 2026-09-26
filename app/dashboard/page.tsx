import React, { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { DashboardClient } from "./dashboard-client";
import { MOCK_TODAY_APPOINTMENTS } from "@/lib/mock-dashboard";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Practice Dashboard | CliniCare",
  description: "Real-time clinic appointments and patient queue",
};

export default async function DashboardPage() {
  const reqHeaders = await headers();
  let userRole: "doctor" | "receptionist" = "doctor";
  let userName: string | undefined;

  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    if (session?.user) {
      const u = session.user as typeof session.user & { role?: string | null };
      userRole = (u.role as "doctor" | "receptionist") || "doctor";
      userName = u.name;
    }
  } catch {
    // fallback
  }

  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading dashboard...</div>}>
      <DashboardClient
        initialAppointments={MOCK_TODAY_APPOINTMENTS}
        sessionRole={userRole}
        sessionUserName={userName}
      />
    </Suspense>
  );
}
