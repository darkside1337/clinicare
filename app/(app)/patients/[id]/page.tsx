import React from "react";
import { notFound } from "next/navigation";
import { PatientProfileClient } from "./patient-profile-client";
import type { PatientRecord } from "@/features/patients/types";
import { getSession } from "@/lib/auth/session";
import { getPatient, getPatientSummary } from "@/features/patients/queries";
import { listAppointmentsForPatient } from "@/features/appointments/queries";
import { listConsultationsForPatient } from "@/features/consultations/queries";
import { listPrescriptionsForPatient } from "@/features/prescriptions/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

import { calculateAge as calcAge } from "@/lib/dates/calculate-age";
import { formatDate, formatTime, formatDateTime } from "@/lib/dates/format";

function calculateAge(dob: string): number {
  return calcAge(dob) ?? 0;
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const isDoctor = session.role === "doctor";

  if (isDoctor) {
    const summary = await getPatientSummary(session.clinicId, id);
    if (!summary) {
      notFound();
    }

    const [patientAppointments, patientConsultations, patientPrescriptions] =
      await Promise.all([
        listAppointmentsForPatient(session.clinicId, id, session.role),
        listConsultationsForPatient(session.clinicId, id),
        listPrescriptionsForPatient(session.clinicId, id),
      ]);

    const record: PatientRecord = {
      patient: {
        id: summary.patient.id,
        name: summary.patient.name,
        dob: summary.patient.dob,
        age: calculateAge(summary.patient.dob),
        sex: (summary.patient.sex as "Male" | "Female" | "Other") || "Other",
        phone: summary.patient.phone || "—",
        email: summary.patient.email || "—",
        address: summary.patient.address || "—",
        registeredDate: formatDate(summary.patient.createdAt),
        emergencyContact: {
          name: "Primary Contact",
          relationship: "Family / Emergency",
          phone: summary.patient.phone || "—",
        },
      },
      allergies: summary.allergies.map((a) => ({
        id: a.id,
        substance: a.substance,
        severity: a.severity as "severe" | "moderate" | "mild",
        reaction: a.reaction || "",
        recordedDate: formatDate(a.createdAt),
      })),
      problems: summary.problems.map((p) => ({
        id: p.id,
        condition: p.condition,
        status: p.status as "active" | "resolved",
        onsetDate: p.onsetDate || formatDate(p.createdAt),
        notes: undefined,
      })),
      appointments: patientAppointments.map((apt) => ({
        id: apt.id,
        doctorName: apt.doctor.name,
        scheduledAt: formatDateTime(apt.scheduledAt),
        status: apt.status,
        isWalkIn: apt.isWalkIn,
        reason: apt.reason || undefined,
      })),
      consultations: patientConsultations.map((c) => ({
        id: c.id,
        appointmentId: c.appointmentId,
        doctorName: c.doctorName,
        date: formatDate(c.createdAt),
        time: formatTime(c.createdAt),
        type: c.appointment?.isWalkIn ? "Walk-in" : "Scheduled",
        chiefComplaint: c.chiefComplaint || "Routine clinical consultation",
        symptoms: c.symptoms || "",
        observations: c.observations || "",
        diagnosis: c.diagnosis || "",
        treatment: c.treatment || "",
        notes: c.notes || undefined,
        hasPrescription: c.hasPrescription,
        prescriptionCount: c.prescriptionCount,
      })),
      prescriptions: patientPrescriptions.map((rx) => ({
        id: rx.id,
        consultationId: rx.consultationId,
        doctorName: "Attending Clinician",
        date: formatDate(rx.createdAt),
        items: rx.items.map((i) => ({
          id: i.id,
          medication: i.medication,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          instructions: i.instructions || "",
        })),
      })),
    };

    return (
      <PatientProfileClient
        initialData={record}
        canStartConsultation={true}
        role="doctor"
      />
    );
  }

  // Receptionist: Zero clinical exposure over the wire
  const [patient, patientAppointments] = await Promise.all([
    getPatient(session.clinicId, id),
    listAppointmentsForPatient(session.clinicId, id, session.role),
  ]);

  if (!patient) {
    notFound();
  }

  const record: PatientRecord = {
    patient: {
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      age: calculateAge(patient.dob),
      sex: (patient.sex as "Male" | "Female" | "Other") || "Other",
      phone: patient.phone || "—",
      email: patient.email || "—",
      address: patient.address || "—",
      registeredDate: formatDate(patient.createdAt),
      emergencyContact: {
        name: "Primary Contact",
        relationship: "Family / Emergency",
        phone: patient.phone || "—",
      },
    },
    allergies: [],
    problems: [],
    appointments: patientAppointments.map((apt) => ({
      id: apt.id,
      doctorName: apt.doctor.name,
      scheduledAt: formatDateTime(apt.scheduledAt),
      status: apt.status,
      isWalkIn: apt.isWalkIn,
      reason: apt.reason || undefined,
    })),
    consultations: [],
    prescriptions: [],
  };

  return (
    <PatientProfileClient
      initialData={record}
      canStartConsultation={false}
      role="receptionist"
    />
  );
}
