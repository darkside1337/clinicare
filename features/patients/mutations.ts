import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  patients,
  allergies,
  problems,
  type Patient,
  type Allergy,
  type Problem,
} from "@/lib/db/schema";
import type {
  PatientInput,
  AllergyInput,
  CreateAllergyInput,
  ProblemInput,
  CreateProblemInput,
} from "./schema";

/**
 * Creates a new patient scoped to clinicId.
 */
export async function createPatient(
  clinicId: string,
  input: PatientInput
): Promise<Patient> {
  const [created] = await db
    .insert(patients)
    .values({
      clinicId,
      name: input.name,
      dob: input.dob,
      sex: input.sex,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
    })
    .returning();

  return created;
}

/**
 * Updates an existing patient within clinicId, if not soft-deleted.
 */
export async function updatePatient(
  clinicId: string,
  patientId: string,
  input: Partial<PatientInput>
): Promise<Patient> {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.dob !== undefined) updateData.dob = input.dob;
  if (input.sex !== undefined) updateData.sex = input.sex;
  if (input.phone !== undefined) updateData.phone = input.phone ?? null;
  if (input.email !== undefined) updateData.email = input.email ?? null;
  if (input.address !== undefined) updateData.address = input.address ?? null;

  const [updated] = await db
    .update(patients)
    .set(updateData)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, patientId),
        isNull(patients.deletedAt)
      )
    )
    .returning();

  if (!updated) {
    throw new Error(`Patient ${patientId} not found in clinic.`);
  }

  return updated;
}

/**
 * Soft deletes a patient by setting deletedAt = now().
 * Never calls db.delete() on patient records.
 */
export async function softDeletePatient(
  clinicId: string,
  patientId: string
): Promise<Patient> {
  const [deleted] = await db
    .update(patients)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, patientId),
        isNull(patients.deletedAt)
      )
    )
    .returning();

  if (!deleted) {
    throw new Error(`Patient ${patientId} not found in clinic.`);
  }

  return deleted;
}

/**
 * Creates an allergy for a patient, ensuring patient belongs to clinicId.
 */
export async function createAllergy(
  clinicId: string,
  input: CreateAllergyInput
): Promise<Allergy> {
  // Enforce tenant boundary
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, input.patientId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!patient) {
    throw new Error(`Patient ${input.patientId} not found in clinic.`);
  }

  const [created] = await db
    .insert(allergies)
    .values({
      patientId: input.patientId,
      substance: input.substance,
      severity: input.severity,
      reaction: input.reaction ?? null,
    })
    .returning();

  return created;
}

/**
 * Updates an allergy, ensuring it belongs to a patient of clinicId.
 */
export async function updateAllergy(
  clinicId: string,
  allergyId: string,
  input: Partial<AllergyInput>
): Promise<Allergy> {
  // Find allergy and check patient ownership
  const [record] = await db
    .select({
      allergyId: allergies.id,
      patientClinicId: patients.clinicId,
    })
    .from(allergies)
    .innerJoin(patients, eq(allergies.patientId, patients.id))
    .where(and(eq(allergies.id, allergyId), eq(patients.clinicId, clinicId)))
    .limit(1);

  if (!record) {
    throw new Error(`Allergy ${allergyId} not found in clinic.`);
  }

  const updateData: Record<string, unknown> = {};
  if (input.substance !== undefined) updateData.substance = input.substance;
  if (input.severity !== undefined) updateData.severity = input.severity;
  if (input.reaction !== undefined) updateData.reaction = input.reaction ?? null;

  const [updated] = await db
    .update(allergies)
    .set(updateData)
    .where(eq(allergies.id, allergyId))
    .returning();

  return updated;
}

/**
 * Deletes an allergy, ensuring it belongs to a patient of clinicId.
 */
export async function deleteAllergy(
  clinicId: string,
  allergyId: string
): Promise<{ id: string }> {
  // Find allergy and verify tenant boundary
  const [record] = await db
    .select({
      allergyId: allergies.id,
    })
    .from(allergies)
    .innerJoin(patients, eq(allergies.patientId, patients.id))
    .where(and(eq(allergies.id, allergyId), eq(patients.clinicId, clinicId)))
    .limit(1);

  if (!record) {
    throw new Error(`Allergy ${allergyId} not found in clinic.`);
  }

  await db.delete(allergies).where(eq(allergies.id, allergyId));
  return { id: allergyId };
}

/**
 * Creates a chronic condition problem, ensuring patient belongs to clinicId.
 */
export async function createProblem(
  clinicId: string,
  input: CreateProblemInput
): Promise<Problem> {
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, input.patientId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!patient) {
    throw new Error(`Patient ${input.patientId} not found in clinic.`);
  }

  const [created] = await db
    .insert(problems)
    .values({
      patientId: input.patientId,
      condition: input.condition,
      status: input.status ?? "active",
      onsetDate: input.onsetDate ?? null,
    })
    .returning();

  return created;
}

/**
 * Updates a problem, ensuring it belongs to a patient of clinicId.
 */
export async function updateProblem(
  clinicId: string,
  problemId: string,
  input: Partial<ProblemInput>
): Promise<Problem> {
  const [record] = await db
    .select({
      problemId: problems.id,
    })
    .from(problems)
    .innerJoin(patients, eq(problems.patientId, patients.id))
    .where(and(eq(problems.id, problemId), eq(patients.clinicId, clinicId)))
    .limit(1);

  if (!record) {
    throw new Error(`Problem ${problemId} not found in clinic.`);
  }

  const updateData: Record<string, unknown> = {};
  if (input.condition !== undefined) updateData.condition = input.condition;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.onsetDate !== undefined) updateData.onsetDate = input.onsetDate ?? null;

  const [updated] = await db
    .update(problems)
    .set(updateData)
    .where(eq(problems.id, problemId))
    .returning();

  return updated;
}
