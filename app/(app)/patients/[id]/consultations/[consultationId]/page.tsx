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

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const parts = dob.includes("-") ? dob.split("-") : dob.split("/").reverse();
  const birthYear = parseInt(parts[0], 10);
  const currentYear = new Date().getFullYear();
  return isNaN(birthYear) ? 0 : Math.max(0, currentYear - birthYear);
}

export default async function ConsultationDetailPage({ params }: PageProps) {
  const session = await requireDoctor();
  const { id, consultationId } = await params;

  // Retrieve real consultation from DB
  const record = await getConsultation(session.clinicId, consultationId);

  if (!record || record.patientId !== id) {
    notFound();
  }

  const d = new Date(record.createdAt);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const consultation: ClinicalConsultationDetail = {
    id: record.id,
    reference: record.id.slice(0, 8).toUpperCase(),
    patientId: record.patientId,
    patientName: record.patient.name,
    patientDob: record.patient.dob,
    patientAge: calculateAge(record.patient.dob),
    patientSex: (record.patient.sex as "Male" | "Female" | "Other") || "Other",
    patientContact: {
      phone: record.patient.phone || "—",
      email: record.patient.email || "—",
      address: record.patient.address || "Registered Practice Address",
    },
    doctorName: record.doctor.name,
    clinicName: "CliniCare Practice",
    clinicAddress: "Primary Care Centre, London",
    consultationDate: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
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
      prescriptionNumber: `RX-${rx.id.slice(0, 8).toUpperCase()}`,
      issuedAt: `${day}/${month}/${year}`,
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
