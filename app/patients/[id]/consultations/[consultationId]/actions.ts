"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth/require-doctor";
import type { ActionResult } from "@/lib/actions";
import {
  updateConsultationSchema,
  type UpdateConsultationInput,
} from "@/features/consultations/schema";
import { updateConsultation } from "@/features/consultations/mutations";
import type { Consultation } from "@/lib/db/schema";

/**
 * Server Action to update clinical notes on an existing consultation encounter.
 * Server-enforced doctor role check; multi-tenant verified.
 */
export async function updateConsultationAction(
  patientId: string,
  consultationId: string,
  input: unknown
): Promise<ActionResult<Consultation>> {
  try {
    const session = await requireDoctor();

    const parsed = updateConsultationSchema.safeParse(input);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMsg };
    }

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
