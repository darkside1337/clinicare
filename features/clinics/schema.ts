import { z } from "zod";

export const ALLOWED_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export const LOGO_MIME_EXTENSIONS: Record<string, string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/jpg": ["jpg", "jpeg"],
  "image/webp": ["webp"],
};

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const clinicLogoSchema = z
  .custom<File>(
    (val) => typeof File !== "undefined" && val instanceof File && val.size > 0,
    { message: "Please select an image file to upload." }
  )
  .refine(
    (file) => (ALLOWED_LOGO_MIME_TYPES as readonly string[]).includes(file.type),
    {
      message: "Invalid file type. Allowed formats: PNG, JPEG, WebP.",
    }
  )
  .refine(
    (file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const validExtensions = LOGO_MIME_EXTENSIONS[file.type];
      return Boolean(extension && validExtensions && validExtensions.includes(extension));
    },
    {
      message: "File extension does not match allowed image format (PNG, JPEG, WebP).",
    }
  )
  .refine(
    (file) => file.size <= MAX_LOGO_SIZE_BYTES,
    {
      message: "File size exceeds 2MB limit.",
    }
  );

export type ClinicLogoInput = z.infer<typeof clinicLogoSchema>;
