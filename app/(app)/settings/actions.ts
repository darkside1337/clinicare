"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth/require-doctor";
import type { ActionResult } from "@/lib/actions";
import { uploadClinicLogo } from "@/lib/supabase/storage";
import { updateClinicLogo } from "@/features/clinics/mutations";

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
  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select an image file to upload." };
  }

  // Validate MIME type
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Allowed formats: PNG, JPEG, WebP.",
    };
  }

  // Validate extension-vs-MIME consistency
  const MIME_EXTENSIONS: Record<string, string[]> = {
    "image/png": ["png"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/jpg": ["jpg", "jpeg"],
    "image/webp": ["webp"],
  };
  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = MIME_EXTENSIONS[file.type];
  if (!extension || !validExtensions || !validExtensions.includes(extension)) {
    return {
      success: false,
      error: "File extension does not match allowed image format (PNG, JPEG, WebP).",
    };
  }

  // Max 2MB limit
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: "File size exceeds 2MB limit.",
    };
  }

  try {
    const publicUrl = await uploadClinicLogo(session.clinicId, file, {
      contentType: file.type,
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
