import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseStorageClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "placeholder-key";

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

/**
 * Reset cached client (primarily for testing)
 */
export function _resetStorageClient(): void {
  cachedClient = null;
}

/**
 * Returns public URL for an asset in Supabase Storage.
 * Defaults to "clinics" bucket.
 */
export function getPublicUrl(path: string, bucket = "clinics"): string {
  const supabase = getSupabaseStorageClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads clinic logo to `clinics/{clinicId}/logo` in the `clinics` bucket.
 * Replaces any existing logo with upsert: true.
 * Returns the public URL.
 */
export async function uploadClinicLogo(
  clinicId: string,
  file: File | Blob | ArrayBuffer,
  options?: { contentType?: string }
): Promise<string> {
  if (!clinicId) {
    throw new Error("clinicId is required to upload clinic logo");
  }

  const supabase = getSupabaseStorageClient();
  const path = `${clinicId}/logo`;

  const contentType =
    options?.contentType ?? (file instanceof File ? file.type : undefined);

  const { error } = await supabase.storage.from("clinics").upload(path, file, {
    upsert: true,
    contentType,
  });

  if (error) {
    throw new Error(`Failed to upload clinic logo: ${error.message}`);
  }

  return getPublicUrl(path, "clinics");
}

/**
 * Uploads doctor signature to `doctors/{doctorId}/signature` in the `doctors` bucket.
 * Replaces any existing signature with upsert: true.
 * Returns a signed URL (default valid for 1 hour).
 */
export async function uploadDoctorSignature(
  doctorId: string,
  file: File | Blob | ArrayBuffer,
  options?: { contentType?: string; expiresIn?: number }
): Promise<string> {
  if (!doctorId) {
    throw new Error("doctorId is required to upload doctor signature");
  }

  const supabase = getSupabaseStorageClient();
  const path = `${doctorId}/signature`;

  const contentType =
    options?.contentType ?? (file instanceof File ? file.type : undefined);

  const { error } = await supabase.storage.from("doctors").upload(path, file, {
    upsert: true,
    contentType,
  });

  if (error) {
    throw new Error(`Failed to upload doctor signature: ${error.message}`);
  }

  const expiresIn = options?.expiresIn ?? 3600;
  const { data, error: signError } = await supabase.storage
    .from("doctors")
    .createSignedUrl(path, expiresIn);

  if (signError || !data?.signedUrl) {
    throw new Error(
      `Failed to create signed URL for signature: ${signError?.message ?? "Unknown error"}`
    );
  }

  return data.signedUrl;
}
