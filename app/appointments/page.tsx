import React, { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppointmentsClient } from "./appointments-client";
import {
  INITIAL_CALENDAR_APPOINTMENTS,
  type ClinicAppointment,
} from "@/lib/mock-appointments";
import { auth } from "@/lib/auth/auth";
import { listAppointmentsForDay } from "@/features/appointments/queries";

export const metadata: Metadata = {
  title: "Appointments & Clinic Calendar | CliniCare",
  description: "Multi-doctor day-view appointment schedule and clinic calendar",
};

function formatTimeSlot(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default async function AppointmentsPage() {
  const reqHeaders = await headers();
  let userRole: "doctor" | "receptionist" = "doctor";
  let userName: string | undefined;
  let clinicId = "clinic-dev";

  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    if (session?.user) {
      const u = session.user as typeof session.user & {
        role?: string | null;
        clinicId?: string | null;
      };
      userRole = (u.role as "doctor" | "receptionist") || "doctor";
      userName = u.name;
      if (u.clinicId) {
        clinicId = u.clinicId;
      }
    }
  } catch {
    // fallback
  }

  let appointmentsData: ClinicAppointment[] = INITIAL_CALENDAR_APPOINTMENTS;

  try {
    const dbAppointments = await listAppointmentsForDay(clinicId, new Date());
    if (dbAppointments.length > 0) {
      appointmentsData = dbAppointments.map((apt) => ({
        id: apt.id,
        patientId: apt.patient.id,
        patientName: apt.patient.name,
        patientDob: apt.patient.dob,
        doctorName: apt.doctor.name,
        timeSlot: formatTimeSlot(apt.scheduledAt),
        durationMinutes: 30,
        status: apt.status,
        reason: apt.reason || "General consultation",
        isWalkIn: apt.isWalkIn,
        allergyFlag: apt.patient.hasSevereAllergy ?? false,
      }));
    }
  } catch (error) {
    console.error("Failed to query appointments for day:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="p-8 font-mono text-xs">Loading appointments...</div>
      }
    >
      <AppointmentsClient
        initialAppointments={appointmentsData}
        sessionRole={userRole}
        sessionUserName={userName}
      />
    </Suspense>
  );
}
