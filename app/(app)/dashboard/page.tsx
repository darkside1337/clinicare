import React, { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { DashboardClient } from "./dashboard-client";
import {
  MOCK_TODAY_APPOINTMENTS,
  type DashboardAppointment,
} from "@/lib/mock-dashboard";
import { auth } from "@/lib/auth/auth";
import { listAppointmentsForDay } from "@/features/appointments/queries";

export const metadata: Metadata = {
  title: "Practice Dashboard | CliniCare",
  description: "Real-time clinic appointments and patient queue",
};

function formatTimeSlot(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function calculateAge(dob: string): number {
  if (!dob) return 40;
  const parts = dob.includes("-") ? dob.split("-") : dob.split("/").reverse();
  const birthYear = parseInt(parts[0], 10);
  const currentYear = new Date().getFullYear();
  return isNaN(birthYear) ? 40 : Math.max(0, currentYear - birthYear);
}

function formatScheduledAt(d: Date): string {
  const dateStr = d.toLocaleDateString("en-GB");
  const timeStr = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} ${timeStr}`;
}

export default async function DashboardPage() {
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

  let appointmentsData: DashboardAppointment[] = MOCK_TODAY_APPOINTMENTS;

  try {
    const dbAppointments = await listAppointmentsForDay(clinicId, new Date());
    if (dbAppointments.length > 0) {
      appointmentsData = dbAppointments.map((apt) => ({
        id: apt.id,
        patientId: apt.patient.id,
        patientName: apt.patient.name,
        patientDob: apt.patient.dob,
        patientAge: calculateAge(apt.patient.dob),
        doctorName: apt.doctor.name,
        scheduledAt: formatScheduledAt(apt.scheduledAt),
        timeSlot: formatTimeSlot(apt.scheduledAt),
        status: apt.status,
        isWalkIn: apt.isWalkIn,
        reason: apt.reason || undefined,
        allergyFlag: apt.patient.hasSevereAllergy ?? false,
      }));
    }
  } catch (error) {
    console.error("Failed to query today's appointments:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="p-8 font-mono text-xs">Loading dashboard...</div>
      }
    >
      <DashboardClient
        initialAppointments={appointmentsData}
        sessionRole={userRole}
        sessionUserName={userName}
      />
    </Suspense>
  );
}
