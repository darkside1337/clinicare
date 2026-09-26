import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AppointmentsClient } from "./appointments-client";
import { INITIAL_CALENDAR_APPOINTMENTS } from "@/lib/mock-appointments";

export const metadata: Metadata = {
  title: "Appointments & Clinic Calendar | CliniCare",
  description: "Multi-doctor day-view appointment schedule and clinic calendar",
};

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading appointments...</div>}>
      <AppointmentsClient initialAppointments={INITIAL_CALENDAR_APPOINTMENTS} />
    </Suspense>
  );
}
