"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
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
  try {
    const session = await getSession();

    const parsed = patientSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMsg };
    }

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
  try {
    const session = await getSession();
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
 */
export async function addAllergyAction(
  patientId: string,
  input: AllergyInput
): Promise<ActionResult<Allergy>> {
  try {
    const session = await getSession();

    const parsed = allergySchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMsg };
    }

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
 * Server Action to delete an allergy.
 */
export async function deleteAllergyAction(
  allergyId: string,
  patientId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
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
 */
export async function addProblemAction(
  patientId: string,
  input: ProblemInput
): Promise<ActionResult<Problem>> {
  try {
    const session = await getSession();

    const parsed = problemSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMsg };
    }

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
 */
export async function updateProblemAction(
  problemId: string,
  patientId: string,
  input: Partial<ProblemInput>
): Promise<ActionResult<Problem>> {
  try {
    const session = await getSession();

    const parsed = problemSchema.partial().safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMsg };
    }

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
