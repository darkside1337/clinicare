import React, { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppointmentsClient } from "./appointments-client";
import { INITIAL_CALENDAR_APPOINTMENTS } from "@/lib/mock-appointments";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Appointments & Clinic Calendar | CliniCare",
  description: "Multi-doctor day-view appointment schedule and clinic calendar",
};

export default async function AppointmentsPage() {
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
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading appointments...</div>}>
      <AppointmentsClient
        initialAppointments={INITIAL_CALENDAR_APPOINTMENTS}
        sessionRole={userRole}
        sessionUserName={userName}
      />
    </Suspense>
  );
}
