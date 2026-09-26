import React from "react";
import type { Metadata } from "next";
import { ConsultationNewClient } from "./consultation-new-client";
import { MOCK_PATIENT_RECORD } from "@/lib/mock-patient";

export const metadata: Metadata = {
  title: "New Clinical Consultation | CliniCare",
  description: "Full-page clinical consultation record and prescription form",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewConsultationPage({ params }: PageProps) {
  const { id } = await params;
  const patient = {
    ...MOCK_PATIENT_RECORD.patient,
    id: id || MOCK_PATIENT_RECORD.patient.id,
  };

  return <ConsultationNewClient patient={patient} />;
}
