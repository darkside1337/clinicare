import React, { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";
import { MOCK_TODAY_APPOINTMENTS } from "@/lib/mock-dashboard";

export const metadata: Metadata = {
  title: "Practice Dashboard | CliniCare",
  description: "Real-time clinic appointments and patient queue",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs">Loading dashboard...</div>}>
      <DashboardClient initialAppointments={MOCK_TODAY_APPOINTMENTS} />
    </Suspense>
  );
}
