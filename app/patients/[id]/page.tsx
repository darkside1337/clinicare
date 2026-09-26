import React from "react";
import { PatientProfileClient } from "./patient-profile-client";
import { MOCK_PATIENT_RECORD } from "@/lib/mock-patient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params;

  // In production, fetch via Drizzle with clinic scoping:
  // const record = await getPatientRecord(id, user.clinicId);
  const record = {
    ...MOCK_PATIENT_RECORD,
    patient: {
      ...MOCK_PATIENT_RECORD.patient,
      id: id || MOCK_PATIENT_RECORD.patient.id,
    },
  };

  return <PatientProfileClient initialData={record} />;
}
