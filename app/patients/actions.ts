"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/actions";
import { patientSchema, type PatientInput } from "@/features/patients/schema";
import { createPatient } from "@/features/patients/mutations";
import type { Patient } from "@/lib/db/schema";

/**
 * Server Action to register a new patient.
 * Resolves session, validates with patientSchema, invokes createPatient mutation.
 */
export async function createPatientAction(
  input: PatientInput
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

    const patient = await createPatient(session.clinicId, parsed.data);
    revalidatePath("/patients");

    return { success: true, data: patient };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create patient. Please try again.",
    };
  }
}
