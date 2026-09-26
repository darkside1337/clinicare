import { and, desc, eq, ilike, isNull, or, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  patients,
  allergies,
  problems,
  appointments,
  consultations,
  prescriptions,
  prescriptionItems,
  type Patient,
  type Allergy,
  type Problem,
  type Appointment,
  type Prescription,
  type PrescriptionItem,
} from "@/lib/db/schema";

/**
 * List patients for a clinic, excluding soft-deleted patients.
 * Optionally filter by search query (name, phone, email).
 */
export async function listPatients(
  clinicId: string,
  search?: string,
): Promise<Patient[]> {
  const conditions = [
    eq(patients.clinicId, clinicId),
    isNull(patients.deletedAt),
  ];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(patients.name, term),
        ilike(patients.phone, term),
        ilike(patients.email, term),
      )!,
    );
  }

  return db
    .select()
    .from(patients)
    .where(and(...conditions))
    .orderBy(desc(patients.createdAt));
}

/**
 * Get a single patient by ID within a clinic, excluding soft-deleted.
 */
export async function getPatient(
  clinicId: string,
  patientId: string,
): Promise<Patient | null> {
  const [patient] = await db
    .select()
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, patientId),
        isNull(patients.deletedAt),
      ),
    )
    .limit(1);

  return patient ?? null;
}

/**
 * Composite patient summary used for patient profile above-the-fold display.
 * Returns patient, active allergies, active problems, recent prescriptions, and upcoming appointments.
 */
export interface PatientSummary {
  patient: Patient;
  allergies: Allergy[];
  problems: Problem[];
  upcomingAppointments: Appointment[];
  recentPrescriptions: Array<{
    prescription: Prescription;
    items: PrescriptionItem[];
    consultationDate: Date;
  }>;
}

export async function getPatientSummary(
  clinicId: string,
  patientId: string,
): Promise<PatientSummary | null> {
  const patient = await getPatient(clinicId, patientId);
  if (!patient) {
    return null;
  }

  // Fetch allergies
  const patientAllergies = await db
    .select()
    .from(allergies)
    .where(eq(allergies.patientId, patientId))
    .orderBy(desc(allergies.createdAt));

  // Fetch problems
  const patientProblems = await db
    .select()
    .from(problems)
    .where(eq(problems.patientId, patientId))
    .orderBy(desc(problems.createdAt));

  // Fetch upcoming appointments
  const upcomingAppointments = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.patientId, patientId),
        gte(appointments.scheduledAt, new Date()),
      ),
    )
    .orderBy(appointments.scheduledAt);

  // Fetch recent consultations and prescriptions
  const patientConsultations = await db
    .select({
      consultationId: consultations.id,
      consultationDate: consultations.createdAt,
    })
    .from(consultations)
    .where(eq(consultations.patientId, patientId))
    .orderBy(desc(consultations.createdAt))
    .limit(5);

  const recentPrescriptions: PatientSummary["recentPrescriptions"] = [];

  if (patientConsultations.length > 0) {
    for (const c of patientConsultations) {
      const rxList = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.consultationId, c.consultationId));

      for (const rx of rxList) {
        const items = await db
          .select()
          .from(prescriptionItems)
          .where(eq(prescriptionItems.prescriptionId, rx.id));

        recentPrescriptions.push({
          prescription: rx,
          items,
          consultationDate: c.consultationDate,
        });
      }
    }
  }

  return {
    patient,
    allergies: patientAllergies,
    problems: patientProblems,
    upcomingAppointments,
    recentPrescriptions,
  };
}

/**
 * List allergies for a patient within a clinic.
 * Returns empty array if patient does not exist or does not belong to the clinic.
 */
export async function listAllergies(
  clinicId: string,
  patientId: string,
): Promise<Allergy[]> {
  const patient = await getPatient(clinicId, patientId);
  if (!patient) {
    return [];
  }

  return db
    .select()
    .from(allergies)
    .where(eq(allergies.patientId, patientId))
    .orderBy(desc(allergies.createdAt));
}

/**
 * List problems for a patient within a clinic.
 * Returns empty array if patient does not exist or does not belong to the clinic.
 */
export async function listProblems(
  clinicId: string,
  patientId: string,
): Promise<Problem[]> {
  const patient = await getPatient(clinicId, patientId);
  if (!patient) {
    return [];
  }

  return db
    .select()
    .from(problems)
    .where(eq(problems.patientId, patientId))
    .orderBy(desc(problems.createdAt));
}
