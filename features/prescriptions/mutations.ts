import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  prescriptions,
  prescriptionItems,
  consultations,
  patients,
} from "@/lib/db/schema";
import type { CreatePrescriptionInput } from "./schema";
import type { PrescriptionWithItems } from "./queries";

/**
 * Creates an itemized prescription record attached to a consultation encounter.
 * Tenancy check: ensures consultation belongs to clinicId via patient join.
 * Atomic: inserts prescription row and all line items inside a single transaction.
 * Calling this multiple times generates distinct, independent prescriptions.
 */
export async function createPrescription(
  clinicId: string,
  input: CreatePrescriptionInput
): Promise<PrescriptionWithItems> {
  // 1. Verify consultation belongs to clinic and patient is not soft-deleted
  const [consultation] = await db
    .select({ id: consultations.id })
    .from(consultations)
    .innerJoin(patients, eq(consultations.patientId, patients.id))
    .where(
      and(
        eq(consultations.id, input.consultationId),
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!consultation) {
    throw new Error(
      `Consultation ${input.consultationId} not found in clinic or not authorized.`
    );
  }

  // 2. Insert prescription and line items atomically in a single transaction
  return await db.transaction(async (tx) => {
    const [newPrescription] = await tx
      .insert(prescriptions)
      .values({
        consultationId: input.consultationId,
      })
      .returning();

    const itemsToInsert = input.items.map((item) => ({
      prescriptionId: newPrescription.id,
      medication: item.medication,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions ?? null,
    }));

    const insertedItems = await tx
      .insert(prescriptionItems)
      .values(itemsToInsert)
      .returning();

    return {
      id: newPrescription.id,
      consultationId: newPrescription.consultationId,
      createdAt: newPrescription.createdAt,
      items: insertedItems.map((item) => ({
        id: item.id,
        prescriptionId: item.prescriptionId,
        medication: item.medication,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      })),
    };
  });
}
