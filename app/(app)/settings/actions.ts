"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth/require-doctor";
import type { ActionResult } from "@/lib/actions";
import { uploadClinicLogo } from "@/lib/supabase/storage";
import { updateClinicLogo } from "@/features/clinics/mutations";

import { clinicLogoSchema } from "@/features/clinics/schema";

/**
 * Server Action for doctors to upload a clinic logo.
 * Enforces requireDoctor role check, validates file constraints,
 * uploads to Supabase Storage, and updates the clinic record.
 */
export async function uploadClinicLogoAction(
  formData: FormData
): Promise<ActionResult<{ logoUrl: string }>> {
  const session = await requireDoctor();

  const file = formData.get("logo");
  const parsed = clinicLogoSchema.safeParse(file);

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid image upload.";
    return { success: false, error: errorMsg };
  }

  const validFile = parsed.data;

  try {
    const publicUrl = await uploadClinicLogo(session.clinicId, validFile, {
      contentType: validFile.type,
    });

    await updateClinicLogo(session.clinicId, publicUrl);

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, data: { logoUrl: publicUrl } };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload clinic logo. Please try again.",
    };
  }
}
