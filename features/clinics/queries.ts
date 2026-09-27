import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { clinics, type Clinic } from "@/lib/db/schema";

/**
 * Retrieves a clinic by its unique ID.
 */
export async function getClinicById(clinicId: string): Promise<Clinic | null> {
  if (!clinicId) return null;

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, clinicId))
    .limit(1);

  return clinic ?? null;
}
