import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { clinics, type Clinic } from "@/lib/db/schema";

/**
 * Updates a clinic's logo URL, strictly scoped to clinicId.
 */
export async function updateClinicLogo(
  clinicId: string,
  logoUrl: string
): Promise<Clinic> {
  if (!clinicId) {
    throw new Error("clinicId is required to update clinic logo");
  }

  const [updated] = await db
    .update(clinics)
    .set({ logoUrl })
    .where(eq(clinics.id, clinicId))
    .returning();

  if (!updated) {
    throw new Error(`Clinic not found: ${clinicId}`);
  }

  return updated;
}
