import type { Patient, Allergy, Problem } from "@/lib/db/schema";
import type {
  PatientRecord,
  PatientProfileData,
  AllergyProfileItem,
  ProblemProfileItem,
  AppointmentProfileItem,
  ConsultationProfileItem,
  PrescriptionProfileItem,
} from "./types";
import { calculateAge as calcAge } from "@/lib/dates/calculate-age";
import { formatDate, formatTime, formatDateTime } from "@/lib/dates/format";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { ConsultationSummary } from "@/features/consultations/queries";
import type { PrescriptionWithItems } from "@/features/prescriptions/queries";

export function toPatientProfileData(patient: Patient): PatientProfileData {
  return {
    id: patient.id,
    name: patient.name,
    dob: patient.dob,
    age: calcAge(patient.dob) ?? 0,
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
  };
}

export function toAllergyProfileItem(a: Allergy): AllergyProfileItem {
  return {
    id: a.id,
    substance: a.substance,
    severity: a.severity as "severe" | "moderate" | "mild",
    reaction: a.reaction || "",
    recordedDate: formatDate(a.createdAt),
    createdAt: a.createdAt,
  };
}

export function toProblemProfileItem(p: Problem): ProblemProfileItem {
  return {
    id: p.id,
    condition: p.condition,
    status: p.status as "active" | "resolved",
    onsetDate: p.onsetDate || formatDate(p.createdAt),
    notes: undefined,
    createdAt: p.createdAt,
  };
}

export function toAppointmentProfileItem(apt: AppointmentDetails): AppointmentProfileItem {
  return {
    id: apt.id,
    doctorName: apt.doctor.name,
    scheduledAt: formatDateTime(apt.scheduledAt),
    status: apt.status,
    isWalkIn: apt.isWalkIn,
    reason: apt.reason || undefined,
  };
}

export function toConsultationProfileItem(c: ConsultationSummary): ConsultationProfileItem {
  return {
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
  };
}

export function toPrescriptionProfileItem(rx: PrescriptionWithItems): PrescriptionProfileItem {
  return {
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
  };
}

export interface MapPatientRecordParams {
  patient: Patient;
  allergies?: Allergy[];
  problems?: Problem[];
  appointments?: AppointmentDetails[];
  consultations?: ConsultationSummary[];
  prescriptions?: PrescriptionWithItems[];
}

export function toPatientRecord({
  patient,
  allergies = [],
  problems = [],
  appointments = [],
  consultations = [],
  prescriptions = [],
}: MapPatientRecordParams): PatientRecord {
  return {
    patient: toPatientProfileData(patient),
    allergies: allergies.map(toAllergyProfileItem),
    problems: problems.map(toProblemProfileItem),
    appointments: appointments.map(toAppointmentProfileItem),
    consultations: consultations.map(toConsultationProfileItem),
    prescriptions: prescriptions.map(toPrescriptionProfileItem),
  };
}
