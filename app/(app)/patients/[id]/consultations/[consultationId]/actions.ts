"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth/require-doctor";
import type { ActionResult } from "@/lib/action-result";
import { updateConsultationSchema } from "@/features/consultations/schema";
import { updateConsultation } from "@/features/consultations/mutations";
import type { Consultation } from "@/lib/db/schema";
import { createPrescriptionSchema } from "@/features/prescriptions/schema";
import { createPrescription } from "@/features/prescriptions/mutations";
import type { PrescriptionWithItems } from "@/features/prescriptions/queries";

/**
 * Server Action to update clinical notes on an existing consultation encounter.
 * Server-enforced doctor role check; multi-tenant verified.
 */
export async function updateConsultationAction(
  patientId: string,
  consultationId: string,
  input: unknown
): Promise<ActionResult<Consultation>> {
  const session = await requireDoctor();

  const parsed = updateConsultationSchema.safeParse(input);

  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const consultation = await updateConsultation(
      session.clinicId,
      consultationId,
      parsed.data
    );

    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/patients/${patientId}/consultations/${consultationId}`);

    return { success: true, data: consultation };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update consultation. Please try again.",
    };
  }
}

/**
 * Server Action to create an itemized prescription for a consultation encounter.
 * Colocated with consultation encounter route per docs/ARCHITECTURE.md §4/§5.
 */
export async function createPrescriptionAction(
  patientId: string,
  consultationIdOrInput: string | unknown,
  optionalInput?: unknown
): Promise<ActionResult<PrescriptionWithItems>> {
  const session = await requireDoctor();

  const rawInput = optionalInput !== undefined ? optionalInput : consultationIdOrInput;
  const parsed = createPrescriptionSchema.safeParse(rawInput);

  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const prescription = await createPrescription(
      session.clinicId,
      parsed.data
    );

    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/patients/${patientId}/consultations/${parsed.data.consultationId}`);

    return { success: true, data: prescription };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create prescription. Please try again.",
    };
  }
}
