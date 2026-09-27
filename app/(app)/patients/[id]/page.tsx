import React from "react";
import { notFound } from "next/navigation";
import { PatientProfileClient } from "./patient-profile-client";
import { getSession } from "@/lib/auth/session";
import { getPatient, getPatientSummary } from "@/features/patients/queries";
import { listAppointmentsForPatient } from "@/features/appointments/queries";
import { listConsultationsForPatient } from "@/features/consultations/queries";
import { listPrescriptionsForPatient } from "@/features/prescriptions/queries";
import { toPatientRecord } from "@/features/patients/mappers";

interface PageProps {
  params: Promise<{ id: string }>;
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

    const record = toPatientRecord({
      patient: summary.patient,
      allergies: summary.allergies,
      problems: summary.problems,
      appointments: patientAppointments,
      consultations: patientConsultations,
      prescriptions: patientPrescriptions,
    });

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

  const record = toPatientRecord({
    patient,
    appointments: patientAppointments,
  });

  return (
    <PatientProfileClient
      initialData={record}
      canStartConsultation={false}
      role="receptionist"
    />
  );
}
