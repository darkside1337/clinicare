"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth/require-doctor";
import type { ActionResult } from "@/lib/actions";
import { createPrescriptionSchema } from "@/features/prescriptions/schema";
import { createPrescription } from "@/features/prescriptions/mutations";
import type { PrescriptionWithItems } from "@/features/prescriptions/queries";

/**
 * Server Action to create an itemized prescription for a consultation encounter.
 * Server-enforced doctor role check; multi-tenant verified.
 * Conforms to EU/UK practice workflow.
 */
export async function createPrescriptionAction(
  patientId: string,
  input: unknown
): Promise<ActionResult<PrescriptionWithItems>> {
  try {
    const session = await requireDoctor();

    const parsed = createPrescriptionSchema.safeParse(input);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMsg };
    }

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
