import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { PatientProfileClient } from "./patient-profile-client";
import { MOCK_PATIENT_RECORD, type PatientRecord } from "@/lib/mock-patient";
import { auth } from "@/lib/auth/auth";
import { getPatientSummary } from "@/features/patients/queries";
import { listAppointmentsForPatient } from "@/features/appointments/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

function calculateAge(dob: string): number {
  if (!dob) return 40;
  const parts = dob.includes("-") ? dob.split("-") : dob.split("/").reverse();
  const birthYear = parseInt(parts[0], 10);
  const currentYear = new Date().getFullYear();
  return isNaN(birthYear) ? 40 : Math.max(0, currentYear - birthYear);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB");
}

function formatDateTime(d: Date): string {
  const dateStr = d.toLocaleDateString("en-GB");
  const timeStr = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} ${timeStr}`;
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params;
  const reqHeaders = await headers();
  let userRole: "doctor" | "receptionist" = "doctor";
  let userName: string | undefined;
  let clinicId = "clinic-dev";

  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    if (session?.user) {
      const u = session.user as typeof session.user & {
        role?: string | null;
        clinicId?: string | null;
      };
      userRole = (u.role as "doctor" | "receptionist") || "doctor";
      userName = u.name;
      if (u.clinicId) {
        clinicId = u.clinicId;
      }
    }
  } catch {
    // fallback
  }

  let record: PatientRecord;

  try {
    const summary = await getPatientSummary(clinicId, id);

    if (summary) {
      // Fetch all appointments for patient
      const patientAppointments = await listAppointmentsForPatient(clinicId, id);

      record = {
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
          emergencyContact:
            id === MOCK_PATIENT_RECORD.patient.id
              ? MOCK_PATIENT_RECORD.patient.emergencyContact
              : {
                  name: "Next of Kin",
                  relationship: "Emergency Contact",
                  phone: summary.patient.phone || "—",
                },
        },
        allergies: summary.allergies.map((a) => ({
          id: a.id,
          substance: a.substance,
          severity: a.severity,
          reaction: a.reaction || "",
          recordedDate: formatDate(a.createdAt),
        })),
        problems: summary.problems.map((p) => ({
          id: p.id,
          condition: p.condition,
          status: p.status,
          onsetDate: p.onsetDate || formatDate(p.createdAt),
          notes: undefined,
        })),
        // Appointments from real DB
        appointments: patientAppointments.map((apt) => ({
          id: apt.id,
          doctorName: apt.doctor.name,
          scheduledAt: formatDateTime(apt.scheduledAt),
          status: apt.status,
          isWalkIn: apt.isWalkIn,
          reason: apt.reason || undefined,
        })),
        // Consultations & prescriptions remain from mock fallback since Phase 5/6 backend is pending
        consultations: MOCK_PATIENT_RECORD.consultations,
        prescriptions: MOCK_PATIENT_RECORD.prescriptions,
      };
    } else if (id === MOCK_PATIENT_RECORD.patient.id) {
      record = MOCK_PATIENT_RECORD;
    } else {
      notFound();
    }
  } catch (error) {
    console.error("Failed to load patient summary:", error);
    if (id === MOCK_PATIENT_RECORD.patient.id) {
      record = MOCK_PATIENT_RECORD;
    } else {
      notFound();
    }
  }

  return (
    <PatientProfileClient
      initialData={record}
      sessionRole={userRole}
      sessionUserName={userName}
    />
  );
}
