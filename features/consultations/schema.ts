import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { consultations } from "@/lib/db/schema";

/**
 * Base Drizzle-Zod select schema.
 */
export const selectConsultationSchema = createSelectSchema(consultations);

/**
 * Clinical narrative free-text fields per docs/PRD.md §8.6.
 * chiefComplaint is required; remaining 5 fields are optional strings.
 */
export const consultationSchema = z.object({
  chiefComplaint: z
    .string()
    .trim()
    .min(1, "Chief complaint is required"),
  symptoms: z.string().trim().optional().or(z.literal("")),
  observations: z.string().trim().optional().or(z.literal("")),
  diagnosis: z.string().trim().optional().or(z.literal("")),
  treatment: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

/**
 * Schema for creating a consultation.
 * patientId is required. appointmentId is optional (auto-provisions walk-in if omitted).
 */
export const createConsultationSchema = consultationSchema.extend({
  patientId: z.string().min(1, "Patient ID is required"),
  appointmentId: z.string().optional(),
});

/**
 * Schema for updating an existing consultation.
 * All clinical narrative fields are optional.
 */
export const updateConsultationSchema = consultationSchema.partial();

export type ConsultationInput = z.infer<typeof consultationSchema>;
export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
