import React from "react";
import { headers } from "next/headers";
import { PatientProfileClient } from "./patient-profile-client";
import { MOCK_PATIENT_RECORD } from "@/lib/mock-patient";
import { auth } from "@/lib/auth/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params;
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

  // In production, fetch via Drizzle with clinic scoping:
  // const record = await getPatientRecord(id, user.clinicId);
  const record = {
    ...MOCK_PATIENT_RECORD,
    patient: {
      ...MOCK_PATIENT_RECORD.patient,
      id: id || MOCK_PATIENT_RECORD.patient.id,
    },
  };

  return (
    <PatientProfileClient
      initialData={record}
      sessionRole={userRole}
      sessionUserName={userName}
    />
  );
}
