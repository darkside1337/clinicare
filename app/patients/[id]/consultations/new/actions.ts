"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth/require-doctor";
import type { ActionResult } from "@/lib/actions";
import {
  createConsultationSchema,
  type CreateConsultationInput,
} from "@/features/consultations/schema";
import { createConsultation } from "@/features/consultations/mutations";
import type { Consultation } from "@/lib/db/schema";

/**
 * Server Action to record a new clinical consultation encounter.
 * Server-enforced doctor role check; updates linked appointment to completed.
 */
export async function createConsultationAction(
  patientId: string,
  input: unknown
): Promise<ActionResult<Consultation>> {
  try {
    const session = await requireDoctor();

    const parsed = createConsultationSchema.safeParse({
      ...(input as Record<string, unknown>),
      patientId,
    });

    if (!parsed.success) {
      const errorMsg = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMsg };
    }

    const consultation = await createConsultation(
      session.clinicId,
      session.user.id,
      parsed.data
    );

    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/patients/${patientId}/consultations/${consultation.id}`);
    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true, data: consultation };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to record consultation. Please try again.",
    };
  }
}
