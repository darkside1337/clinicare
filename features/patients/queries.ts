import { and, desc, eq, ilike, inArray, isNull, or, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import type { UserRole } from "@/lib/auth/session";
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

export interface PatientDirectoryItem extends Patient {
  hasSevereAllergy: boolean;
  allergySummary?: string;
  activeConditions: string[];
}

/**
 * List patients with their allergy flags and active problems for directory display.
 * Clinical safety data (allergies, active conditions) is strictly gated to doctor callers.
 */
export async function listPatientsDirectory(
  clinicId: string,
  role: UserRole,
  search?: string,
): Promise<PatientDirectoryItem[]> {
  const patientList = await listPatients(clinicId, search);
  if (patientList.length === 0) {
    return [];
  }

  // Receptionists never receive allergy flags or active conditions, and never run clinical sub-queries
  if (role !== "doctor") {
    return patientList.map((p) => ({
      ...p,
      hasSevereAllergy: false,
      allergySummary: undefined,
      activeConditions: [],
    }));
  }

  const patientIds = patientList.map((p) => p.id);

  const allergyRows = await db
    .select({
      patientId: allergies.patientId,
      substance: allergies.substance,
      severity: allergies.severity,
      reaction: allergies.reaction,
    })
    .from(allergies)
    .where(inArray(allergies.patientId, patientIds));

  const problemRows = await db
    .select({
      patientId: problems.patientId,
      condition: problems.condition,
    })
    .from(problems)
    .where(
      and(
        inArray(problems.patientId, patientIds),
        eq(problems.status, "active"),
      ),
    );

  const allergiesByPatient = new Map<string, typeof allergyRows>();
  for (const a of allergyRows) {
    const arr = allergiesByPatient.get(a.patientId) || [];
    arr.push(a);
    allergiesByPatient.set(a.patientId, arr);
  }

  const problemsByPatient = new Map<string, string[]>();
  for (const pr of problemRows) {
    const arr = problemsByPatient.get(pr.patientId) || [];
    arr.push(pr.condition);
    problemsByPatient.set(pr.patientId, arr);
  }

  return patientList.map((p) => {
    const pAllergies = allergiesByPatient.get(p.id) || [];
    const severeAllergy = pAllergies.find((a) => a.severity === "severe");
    const activeConditions = problemsByPatient.get(p.id) || [];

    return {
      ...p,
      hasSevereAllergy: !!severeAllergy,
      allergySummary: severeAllergy
        ? `${severeAllergy.substance}${severeAllergy.reaction ? ` (${severeAllergy.reaction})` : ""}`
        : undefined,
      activeConditions,
    };
  });
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
