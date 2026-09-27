import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireDoctor } from "@/lib/auth/require-doctor";
import { getConsultation } from "@/features/consultations/queries";
import { ConsultationDetailClient } from "./consultation-detail-client";
import type { ClinicalConsultationDetail } from "@/features/consultations/types";

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

import { calculateAge } from "@/lib/dates/calculate-age";
import { formatDate, formatTime } from "@/lib/dates/format";
import { formatRxNumber } from "@/features/prescriptions/presenters";

export default async function ConsultationDetailPage({ params }: PageProps) {
  const session = await requireDoctor();
  const { id, consultationId } = await params;

  // Retrieve real consultation from DB
  const record = await getConsultation(session.clinicId, consultationId);

  if (!record || record.patientId !== id) {
    notFound();
  }

  const d = new Date(record.createdAt);
  const consultationDate = formatDate(d);
  const consultationTime = formatTime(d);

  const consultation: ClinicalConsultationDetail = {
    id: record.id,
    reference: record.id.slice(0, 8).toUpperCase(),
    patientId: record.patientId,
    patientName: record.patient.name,
    patientDob: record.patient.dob,
    patientAge: calculateAge(record.patient.dob) ?? 0,
    patientSex: (record.patient.sex as "Male" | "Female" | "Other") || "Other",
    patientContact: {
      phone: record.patient.phone || "—",
      email: record.patient.email || "—",
      address: record.patient.address || "Registered Practice Address",
    },
    doctorName: record.doctor.name,
    clinicName: "CliniCare Practice",
    clinicAddress: "Primary Care Centre, London",
    consultationDate,
    time: consultationTime,
    encounterType: record.appointment.isWalkIn ? "Walk-In" : "Scheduled",
    chiefComplaint: record.chiefComplaint || "",
    symptoms: record.symptoms || "",
    observations: record.observations || "",
    diagnosis: record.diagnosis || "",
    treatment: record.treatment || "",
    notes: record.notes || "",
    prescriptions: record.prescriptions.map((rx) => ({
      id: rx.id,
      consultationId: record.id,
      prescriptionNumber: formatRxNumber(rx.id),
      issuedAt: consultationDate,
      items: rx.items.map((item) => ({
        id: item.id,
        medication: item.medication,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions || "",
      })),
    })),
  };

  return <ConsultationDetailClient consultation={consultation} />;
}
