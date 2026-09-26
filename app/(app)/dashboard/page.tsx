import React, { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";
import { getSession } from "@/lib/auth/session";
import { listAppointmentsForDay } from "@/features/appointments/queries";
import { listPatientsDirectory } from "@/features/patients/queries";

export const metadata: Metadata = {
  title: "Practice Dashboard | CliniCare",
  description: "Real-time clinic appointments and patient queue",
};

export default async function DashboardPage() {
  const session = await getSession();

  const [dbAppointments, directoryPatients] = await Promise.all([
    listAppointmentsForDay(session.clinicId, new Date(), session.role),
    listPatientsDirectory(session.clinicId, session.role),
  ]);

  const formPatients = directoryPatients.map((p) => ({
    id: p.id,
    name: p.name,
    dob: p.dob,
    hasSevereAllergy: p.hasSevereAllergy,
  }));

  const recentPatients = directoryPatients.slice(0, 5);

  return (
    <Suspense
      fallback={
        <div className="p-8 font-mono text-xs text-muted-foreground">
          Loading dashboard...
        </div>
      }
    >
      <DashboardClient
        initialAppointments={dbAppointments}
        recentPatients={recentPatients}
        patients={formPatients}
        sessionRole={session.role}
        sessionUserName={session.user.name}
      />
    </Suspense>
  );
}
