import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  consultations,
  patients,
  appointments,
  user,
  prescriptions,
  prescriptionItems,
  type Consultation,
} from "@/lib/db/schema";

export interface ConsultationSummary extends Consultation {
  doctorName: string;
  appointment: {
    id: string;
    scheduledAt: Date;
    isWalkIn: boolean;
    status: string;
  };
  hasPrescription: boolean;
  prescriptionCount: number;
}

export interface ConsultationDetail extends ConsultationSummary {
  patient: {
    id: string;
    name: string;
    dob: string;
    sex: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  doctor: {
    id: string;
    name: string;
    email: string;
  };
  prescriptions: Array<{
    id: string;
    createdAt: Date;
    items: Array<{
      id: string;
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string | null;
    }>;
  }>;
}

/**
 * List all consultations for a patient in reverse-chronological order.
 * Enforces tenant boundary by checking that patient belongs to clinicId.
 */
export async function listConsultationsForPatient(
  clinicId: string,
  patientId: string
): Promise<ConsultationSummary[]> {
  // 1. Verify patient belongs to clinic and is not soft-deleted
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, patientId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!patient) {
    return [];
  }

  // 2. Query consultations with doctor and appointment details
  const rows = await db
    .select({
      id: consultations.id,
      patientId: consultations.patientId,
      doctorId: consultations.doctorId,
      appointmentId: consultations.appointmentId,
      chiefComplaint: consultations.chiefComplaint,
      symptoms: consultations.symptoms,
      observations: consultations.observations,
      diagnosis: consultations.diagnosis,
      treatment: consultations.treatment,
      notes: consultations.notes,
      createdAt: consultations.createdAt,
      updatedAt: consultations.updatedAt,
      doctorName: user.name,
      appointmentScheduledAt: appointments.scheduledAt,
      appointmentIsWalkIn: appointments.isWalkIn,
      appointmentStatus: appointments.status,
    })
    .from(consultations)
    .innerJoin(user, eq(consultations.doctorId, user.id))
    .innerJoin(appointments, eq(consultations.appointmentId, appointments.id))
    .where(eq(consultations.patientId, patientId))
    .orderBy(desc(consultations.createdAt));

  if (rows.length === 0) {
    return [];
  }

  // 3. Batch check for attached prescriptions
  const consultationIds = rows.map((r) => r.id);
  const rxRows = await db
    .select({
      id: prescriptions.id,
      consultationId: prescriptions.consultationId,
    })
    .from(prescriptions)
    .where(inArray(prescriptions.consultationId, consultationIds));

  const rxCountMap = new Map<string, number>();
  for (const rx of rxRows) {
    rxCountMap.set(rx.consultationId, (rxCountMap.get(rx.consultationId) || 0) + 1);
  }

  return rows.map((row) => {
    const rxCount = rxCountMap.get(row.id) || 0;
    return {
      id: row.id,
      patientId: row.patientId,
      doctorId: row.doctorId,
      appointmentId: row.appointmentId,
      chiefComplaint: row.chiefComplaint,
      symptoms: row.symptoms,
      observations: row.observations,
      diagnosis: row.diagnosis,
      treatment: row.treatment,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      doctorName: row.doctorName,
      appointment: {
        id: row.appointmentId,
        scheduledAt: row.appointmentScheduledAt,
        isWalkIn: row.appointmentIsWalkIn,
        status: row.appointmentStatus,
      },
      hasPrescription: rxCount > 0,
      prescriptionCount: rxCount,
    };
  });
}

/**
 * Get a single consultation with all details, including patient, doctor,
 * appointment, and any linked prescriptions with their line items.
 * Enforces tenant boundary by joining patients on clinicId.
 */
export async function getConsultation(
  clinicId: string,
  consultationId: string
): Promise<ConsultationDetail | null> {
  const [row] = await db
    .select({
      id: consultations.id,
      patientId: consultations.patientId,
      doctorId: consultations.doctorId,
      appointmentId: consultations.appointmentId,
      chiefComplaint: consultations.chiefComplaint,
      symptoms: consultations.symptoms,
      observations: consultations.observations,
      diagnosis: consultations.diagnosis,
      treatment: consultations.treatment,
      notes: consultations.notes,
      createdAt: consultations.createdAt,
      updatedAt: consultations.updatedAt,
      patientClinicId: patients.clinicId,
      patientName: patients.name,
      patientDob: patients.dob,
      patientSex: patients.sex,
      patientPhone: patients.phone,
      patientEmail: patients.email,
      patientAddress: patients.address,
      doctorName: user.name,
      doctorEmail: user.email,
      appointmentScheduledAt: appointments.scheduledAt,
      appointmentIsWalkIn: appointments.isWalkIn,
      appointmentStatus: appointments.status,
      appointmentReason: appointments.reason,
    })
    .from(consultations)
    .innerJoin(patients, eq(consultations.patientId, patients.id))
    .innerJoin(user, eq(consultations.doctorId, user.id))
    .innerJoin(appointments, eq(consultations.appointmentId, appointments.id))
    .where(
      and(
        eq(consultations.id, consultationId),
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!row) {
    return null;
  }

  // Fetch linked prescriptions
  const rxList = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.consultationId, consultationId))
    .orderBy(desc(prescriptions.createdAt));

  const prescriptionIds = rxList.map((rx) => rx.id);
  const items = prescriptionIds.length > 0
    ? await db
        .select()
        .from(prescriptionItems)
        .where(inArray(prescriptionItems.prescriptionId, prescriptionIds))
    : [];

  const itemsByRx = new Map<string, typeof items>();
  for (const item of items) {
    const existing = itemsByRx.get(item.prescriptionId) || [];
    existing.push(item);
    itemsByRx.set(item.prescriptionId, existing);
  }

  const enrichedPrescriptions = rxList.map((rx) => ({
    id: rx.id,
    createdAt: rx.createdAt,
    items: (itemsByRx.get(rx.id) || []).map((i) => ({
      id: i.id,
      medication: i.medication,
      dosage: i.dosage,
      frequency: i.frequency,
      duration: i.duration,
      instructions: i.instructions,
    })),
  }));

  return {
    id: row.id,
    patientId: row.patientId,
    doctorId: row.doctorId,
    appointmentId: row.appointmentId,
    chiefComplaint: row.chiefComplaint,
    symptoms: row.symptoms,
    observations: row.observations,
    diagnosis: row.diagnosis,
    treatment: row.treatment,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    doctorName: row.doctorName,
    appointment: {
      id: row.appointmentId,
      scheduledAt: row.appointmentScheduledAt,
      isWalkIn: row.appointmentIsWalkIn,
      status: row.appointmentStatus,
    },
    hasPrescription: enrichedPrescriptions.length > 0,
    prescriptionCount: enrichedPrescriptions.length,
    patient: {
      id: row.patientId,
      name: row.patientName,
      dob: row.patientDob,
      sex: row.patientSex,
      phone: row.patientPhone,
      email: row.patientEmail,
      address: row.patientAddress,
    },
    doctor: {
      id: row.doctorId,
      name: row.doctorName,
      email: row.doctorEmail,
    },
    prescriptions: enrichedPrescriptions,
  };
}
