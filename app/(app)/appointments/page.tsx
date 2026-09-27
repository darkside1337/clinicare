import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AppointmentsClient } from "./appointments-client";
import { getSession } from "@/lib/auth/session";
import { listAppointmentsForDay } from "@/features/appointments/queries";
import { listPatientsDirectory } from "@/features/patients/queries";

export const metadata: Metadata = {
  title: "Appointments & Clinic Calendar | CliniCare",
  description: "Multi-doctor day-view appointment schedule and clinic calendar",
};

interface PageProps {
  searchParams: Promise<{ date?: string; doctorId?: string }>;
}

import { toISODate } from "@/lib/dates/format";

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const session = await getSession();
  const { date, doctorId } = await searchParams;

  let targetDate = new Date();
  if (date) {
    const parsed = new Date(date + "T00:00:00");
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  const effectiveDoctorId = doctorId && doctorId !== "all" ? doctorId : undefined;

  const [dbAppointments, directoryPatients] = await Promise.all([
    listAppointmentsForDay(session.clinicId, targetDate, session.role, effectiveDoctorId),
    listPatientsDirectory(session.clinicId, session.role),
  ]);

  const formPatients = directoryPatients.map((p) => ({
    id: p.id,
    name: p.name,
    dob: p.dob,
    hasSevereAllergy: p.hasSevereAllergy,
  }));

  return (
    <Suspense
      fallback={
        <div className="p-8 font-mono text-xs text-muted-foreground">
          Loading appointments...
        </div>
      }
    >
      <AppointmentsClient
        initialAppointments={dbAppointments}
        patients={formPatients}
        currentDateISO={toISODate(targetDate)}
        currentDoctorId={effectiveDoctorId}
        sessionRole={session.role}
        sessionUserName={session.user.name}
      />
    </Suspense>
  );
}
