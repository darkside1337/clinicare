import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  prescriptions,
  prescriptionItems,
  consultations,
  patients,
  user,
  clinics,
} from "@/lib/db/schema";

export interface PrescriptionItemDetail {
  id: string;
  prescriptionId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

export interface PrescriptionWithItems {
  id: string;
  consultationId: string;
  createdAt: Date;
  items: PrescriptionItemDetail[];
}

export interface PrescriptionDetail extends PrescriptionWithItems {
  patient: {
    id: string;
    name: string;
    dob: string;
    age: number;
    sex: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  doctor: {
    id: string;
    name: string;
    email: string;
  };
  clinic: {
    id: string;
    name: string;
    logoUrl: string | null;
    address?: string | null;
  };
  consultation: {
    id: string;
    chiefComplaint: string | null;
    diagnosis: string | null;
    createdAt: Date;
  };
}

/**
 * Calculates accurate age from date of birth string.
 * Supports ISO (YYYY-MM-DD) and UK (DD/MM/YYYY) formats.
 */
export function calculateAge(dob: string): number {
  if (!dob) return 0;
  const parts = dob.includes("-") ? dob.split("-") : dob.split("/").reverse();
  const birthDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Fetches a single prescription with line items, patient demographics,
 * attending prescriber, and clinic details.
 * Multi-tenant safe: strictly enforces `patients.clinicId = clinicId`.
 */
export async function getPrescription(
  clinicId: string,
  prescriptionId: string
): Promise<PrescriptionDetail | null> {
  const [row] = await db
    .select({
      id: prescriptions.id,
      consultationId: prescriptions.consultationId,
      createdAt: prescriptions.createdAt,
      patientId: patients.id,
      patientName: patients.name,
      patientDob: patients.dob,
      patientSex: patients.sex,
      patientAddress: patients.address,
      patientPhone: patients.phone,
      patientEmail: patients.email,
      doctorId: user.id,
      doctorName: user.name,
      doctorEmail: user.email,
      clinicId: clinics.id,
      clinicName: clinics.name,
      clinicLogoUrl: clinics.logoUrl,
      consultationChiefComplaint: consultations.chiefComplaint,
      consultationDiagnosis: consultations.diagnosis,
      consultationCreatedAt: consultations.createdAt,
    })
    .from(prescriptions)
    .innerJoin(consultations, eq(prescriptions.consultationId, consultations.id))
    .innerJoin(patients, eq(consultations.patientId, patients.id))
    .innerJoin(user, eq(consultations.doctorId, user.id))
    .innerJoin(clinics, eq(patients.clinicId, clinics.id))
    .where(
      and(
        eq(prescriptions.id, prescriptionId),
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const items = await db
    .select({
      id: prescriptionItems.id,
      prescriptionId: prescriptionItems.prescriptionId,
      medication: prescriptionItems.medication,
      dosage: prescriptionItems.dosage,
      frequency: prescriptionItems.frequency,
      duration: prescriptionItems.duration,
      instructions: prescriptionItems.instructions,
    })
    .from(prescriptionItems)
    .where(eq(prescriptionItems.prescriptionId, prescriptionId));

  return {
    id: row.id,
    consultationId: row.consultationId,
    createdAt: row.createdAt,
    items,
    patient: {
      id: row.patientId,
      name: row.patientName,
      dob: row.patientDob,
      age: calculateAge(row.patientDob),
      sex: row.patientSex,
      address: row.patientAddress,
      phone: row.patientPhone,
      email: row.patientEmail,
    },
    doctor: {
      id: row.doctorId,
      name: row.doctorName,
      email: row.doctorEmail,
    },
    clinic: {
      id: row.clinicId,
      name: row.clinicName,
      logoUrl: row.clinicLogoUrl,
    },
    consultation: {
      id: row.consultationId,
      chiefComplaint: row.consultationChiefComplaint,
      diagnosis: row.consultationDiagnosis,
      createdAt: row.consultationCreatedAt,
    },
  };
}

/**
 * List all independent prescriptions attached to a consultation.
 * Supports multi-prescription workflow per consultation encounter.
 */
export async function listPrescriptionsForConsultation(
  clinicId: string,
  consultationId: string
): Promise<PrescriptionWithItems[]> {
  // 1. Verify consultation belongs to clinic and patient is not deleted
  const [consultation] = await db
    .select({ id: consultations.id })
    .from(consultations)
    .innerJoin(patients, eq(consultations.patientId, patients.id))
    .where(
      and(
        eq(consultations.id, consultationId),
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!consultation) {
    return [];
  }

  // 2. Fetch prescriptions ordered by newest first
  const rxRows = await db
    .select({
      id: prescriptions.id,
      consultationId: prescriptions.consultationId,
      createdAt: prescriptions.createdAt,
    })
    .from(prescriptions)
    .where(eq(prescriptions.consultationId, consultationId))
    .orderBy(desc(prescriptions.createdAt));

  if (rxRows.length === 0) {
    return [];
  }

  const rxIds = rxRows.map((rx) => rx.id);
  const items = await db
    .select({
      id: prescriptionItems.id,
      prescriptionId: prescriptionItems.prescriptionId,
      medication: prescriptionItems.medication,
      dosage: prescriptionItems.dosage,
      frequency: prescriptionItems.frequency,
      duration: prescriptionItems.duration,
      instructions: prescriptionItems.instructions,
    })
    .from(prescriptionItems)
    .where(inArray(prescriptionItems.prescriptionId, rxIds));

  const itemsByRx = new Map<string, PrescriptionItemDetail[]>();
  for (const item of items) {
    const list = itemsByRx.get(item.prescriptionId) || [];
    list.push(item);
    itemsByRx.set(item.prescriptionId, list);
  }

  return rxRows.map((rx) => ({
    ...rx,
    items: itemsByRx.get(rx.id) || [],
  }));
}

/**
 * List all prescriptions issued to a patient across all consultations.
 * Multi-tenant safe: strictly enforces `patients.clinicId = clinicId`.
 */
export async function listPrescriptionsForPatient(
  clinicId: string,
  patientId: string
): Promise<PrescriptionWithItems[]> {
  // 1. Verify patient belongs to clinic and is not deleted
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.id, patientId),
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!patient) {
    return [];
  }

  // 2. Fetch prescriptions linked through consultations
  const rxRows = await db
    .select({
      id: prescriptions.id,
      consultationId: prescriptions.consultationId,
      createdAt: prescriptions.createdAt,
    })
    .from(prescriptions)
    .innerJoin(consultations, eq(prescriptions.consultationId, consultations.id))
    .where(eq(consultations.patientId, patientId))
    .orderBy(desc(prescriptions.createdAt));

  if (rxRows.length === 0) {
    return [];
  }

  const rxIds = rxRows.map((rx) => rx.id);
  const items = await db
    .select({
      id: prescriptionItems.id,
      prescriptionId: prescriptionItems.prescriptionId,
      medication: prescriptionItems.medication,
      dosage: prescriptionItems.dosage,
      frequency: prescriptionItems.frequency,
      duration: prescriptionItems.duration,
      instructions: prescriptionItems.instructions,
    })
    .from(prescriptionItems)
    .where(inArray(prescriptionItems.prescriptionId, rxIds));

  const itemsByRx = new Map<string, PrescriptionItemDetail[]>();
  for (const item of items) {
    const list = itemsByRx.get(item.prescriptionId) || [];
    list.push(item);
    itemsByRx.set(item.prescriptionId, list);
  }

  return rxRows.map((rx) => ({
    ...rx,
    items: itemsByRx.get(rx.id) || [],
  }));
}
