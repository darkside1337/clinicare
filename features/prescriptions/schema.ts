import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { prescriptions, prescriptionItems } from "@/lib/db/schema";

/**
 * Base Drizzle-Zod select schemas.
 */
export const selectPrescriptionSchema = createSelectSchema(prescriptions);
export const selectPrescriptionItemSchema = createSelectSchema(prescriptionItems);

/**
 * Zod schema for an individual medication line item.
 * Per docs/PRD.md §8.7 and docs/ROADMAP.md §6.1.
 */
export const prescriptionItemSchema = z.object({
  medication: z
    .string()
    .trim()
    .min(1, "Medication name is required"),
  dosage: z
    .string()
    .trim()
    .min(1, "Dosage is required"),
  frequency: z
    .string()
    .trim()
    .min(1, "Frequency is required"),
  duration: z
    .string()
    .trim()
    .min(1, "Duration is required"),
  instructions: z.string().trim().nullish().or(z.literal("")),
});

/**
 * Zod schema for creating a prescription attached to a consultation.
 * Requires consultationId and at least one medication item (min 1).
 */
export const createPrescriptionSchema = z.object({
  consultationId: z
    .string()
    .trim()
    .min(1, "Consultation ID is required"),
  items: z
    .array(prescriptionItemSchema)
    .min(1, "At least one prescription item is required"),
});

export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
