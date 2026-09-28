"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { requireDoctor } from "@/lib/auth/require-doctor";
import type { ActionResult } from "@/lib/actions";
import {
  patientSchema,
  allergySchema,
  problemSchema,
  type PatientInput,
  type AllergyInput,
  type ProblemInput,
} from "@/features/patients/schema";
import {
  updatePatient,
  softDeletePatient,
  createAllergy,
  updateAllergy,
  deleteAllergy,
  createProblem,
  updateProblem,
} from "@/features/patients/mutations";
import type { Patient, Allergy, Problem } from "@/lib/db/schema";

/**
 * Server Action to update patient demographics.
 */
export async function updatePatientAction(
  patientId: string,
  input: Partial<PatientInput>
): Promise<ActionResult<Patient>> {
  const session = await getSession();

  const parsed = patientSchema.partial().safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const patient = await updatePatient(
      session.clinicId,
      patientId,
      parsed.data
    );

    revalidatePath("/patients");
    revalidatePath(`/patients/${patientId}`);

    return { success: true, data: patient };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update patient. Please try again.",
    };
  }
}

/**
 * Server Action to soft-delete a patient.
 */
export async function softDeletePatientAction(
  patientId: string
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();

  try {
    await softDeletePatient(session.clinicId, patientId);

    revalidatePath("/patients");

    return { success: true, data: { id: patientId } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete patient. Please try again.",
    };
  }
}

/**
 * Server Action to add an allergy to a patient.
 * Server-enforced doctor role check; multi-tenant verified.
 */
export async function addAllergyAction(
  patientId: string,
  input: AllergyInput
): Promise<ActionResult<Allergy>> {
  const session = await requireDoctor();

  const parsed = allergySchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const allergy = await createAllergy(session.clinicId, {
      ...parsed.data,
      patientId,
    });

    revalidatePath(`/patients/${patientId}`);

    return { success: true, data: allergy };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to add allergy. Please try again.",
    };
  }
}

/**
 * Server Action to update an allergy.
 * Server-enforced doctor role check; multi-tenant verified via clinicId.
 */
export async function updateAllergyAction(
  allergyId: string,
  patientId: string,
  input: Partial<AllergyInput>
): Promise<ActionResult<Allergy>> {
  const session = await requireDoctor();

  const parsed = allergySchema.partial().safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const allergy = await updateAllergy(
      session.clinicId,
      allergyId,
      parsed.data
    );

    revalidatePath(`/patients/${patientId}`);

    return { success: true, data: allergy };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update allergy. Please try again.",
    };
  }
}

/**
 * Server Action to delete an allergy.
 * Server-enforced doctor role check; multi-tenant verified.
 */
export async function deleteAllergyAction(
  allergyId: string,
  patientId: string
): Promise<ActionResult<{ id: string }>> {
  const session = await requireDoctor();

  try {
    const result = await deleteAllergy(session.clinicId, allergyId);

    revalidatePath(`/patients/${patientId}`);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove allergy. Please try again.",
    };
  }
}

/**
 * Server Action to add a chronic problem to a patient.
 * Server-enforced doctor role check; multi-tenant verified.
 */
export async function addProblemAction(
  patientId: string,
  input: ProblemInput
): Promise<ActionResult<Problem>> {
  const session = await requireDoctor();

  const parsed = problemSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const problem = await createProblem(session.clinicId, {
      ...parsed.data,
      patientId,
    });

    revalidatePath(`/patients/${patientId}`);

    return { success: true, data: problem };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to record problem. Please try again.",
    };
  }
}

/**
 * Server Action to update a chronic problem.
 * Server-enforced doctor role check; multi-tenant verified.
 */
export async function updateProblemAction(
  problemId: string,
  patientId: string,
  input: Partial<ProblemInput>
): Promise<ActionResult<Problem>> {
  const session = await requireDoctor();

  const parsed = problemSchema.partial().safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const problem = await updateProblem(
      session.clinicId,
      problemId,
      parsed.data
    );

    revalidatePath(`/patients/${patientId}`);

    return { success: true, data: problem };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update problem. Please try again.",
    };
  }
}
