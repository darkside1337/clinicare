import React from "react";
import type { Metadata } from "next";
import { requireDoctor } from "@/lib/auth/require-doctor";
import { getConsultation } from "@/features/consultations/queries";
import { ConsultationDetailClient } from "./consultation-detail-client";
import { MOCK_CONSULTATION_DETAILS, type ClinicalConsultationDetail } from "@/lib/mock-consultations";
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
  const session = await requireDoctor();
  const { id, consultationId } = await params;

  // Retrieve real consultation from DB
  const record = await getConsultation(session.clinicId, consultationId);

  let consultation: ClinicalConsultationDetail;

  if (record) {
    const d = new Date(record.createdAt);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    consultation = {
      id: record.id,
      reference: record.id.slice(0, 8).toUpperCase(),
      patientId: record.patientId,
      patientName: record.patient.name,
      patientDob: record.patient.dob,
      patientAge: 0,
      patientSex: record.patient.sex as "Male" | "Female" | "Other",
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
  } else {
    // Fallback populated from mock patient for dev preview
    let mock = MOCK_CONSULTATION_DETAILS[consultationId];
    if (!mock) {
      const patient =
        MOCK_SEARCH_PATIENTS.find((p) => p.id === id) ||
        MOCK_SEARCH_PATIENTS[0];
      mock = {
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
        consultationDate: "26/09/2026",
        time: "10:15",
      };
    }
    consultation = mock;
  }

  return <ConsultationDetailClient consultation={consultation} />;
}
