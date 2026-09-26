import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireDoctor } from "@/lib/auth/require-doctor";
import { getPatient } from "@/features/patients/queries";
import { ConsultationNewClient } from "./consultation-new-client";

export const metadata: Metadata = {
  title: "New Clinical Consultation | CliniCare",
  description: "Full-page clinical consultation record and prescription form",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ appointmentId?: string }>;
}

export default async function NewConsultationPage({
  params,
  searchParams,
}: PageProps) {
  const session = await requireDoctor();
  const { id } = await params;
  const { appointmentId } = await searchParams;

  const patient = await getPatient(session.clinicId, id);
  if (!patient) {
    notFound();
  }

  return (
    <ConsultationNewClient
      patient={patient}
      appointmentId={appointmentId}
      doctorName={session.user.name}
    />
  );
}
