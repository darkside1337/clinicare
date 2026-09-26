import React from "react";
import type { Metadata } from "next";
import { ConsultationDetailClient } from "./consultation-detail-client";
import { MOCK_CONSULTATION_DETAILS } from "@/lib/mock-consultations";
import { MOCK_SEARCH_PATIENTS } from "@/lib/mock-patients-directory";

interface PageProps {
  params: Promise<{ id: string; consultationId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { consultationId } = await params;
  return {
    title: `Consultation ${consultationId.toUpperCase()} | CliniCare`,
    description: "Clinical consultation notes and prescription records",
  };
}

export default async function ConsultationDetailPage({ params }: PageProps) {
  const { id, consultationId } = await params;

  // Retrieve consultation or fallback populated from mock patient
  let consultation = MOCK_CONSULTATION_DETAILS[consultationId];

  if (!consultation) {
    const patient = MOCK_SEARCH_PATIENTS.find((p) => p.id === id) || MOCK_SEARCH_PATIENTS[0];
    consultation = {
      ...MOCK_CONSULTATION_DETAILS["cns-2026-03"],
      id: consultationId,
      reference: consultationId.toUpperCase(),
      patientId: patient.id,
      patientName: patient.name,
      patientDob: patient.dob,
      patientAge: patient.age,
      patientSex: patient.sex,
      patientContact: {
        phone: patient.phone,
        email: patient.email || "",
        address: "Registered Practice Address",
      },
      consultationDate: "24/09/2026",
      time: "10:15",
    };
  }

  return <ConsultationDetailClient consultation={consultation} />;
}
