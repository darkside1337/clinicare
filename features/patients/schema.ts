import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { patients, allergies, problems } from "@/lib/db/schema";

// Base Drizzle-Zod Schemas
export const selectPatientSchema = createSelectSchema(patients);
export const insertPatientSchema = createInsertSchema(patients);

export const selectAllergySchema = createSelectSchema(allergies);
export const insertAllergySchema = createInsertSchema(allergies);

export const selectProblemSchema = createSelectSchema(problems);
export const insertProblemSchema = createInsertSchema(problems);

export const sexEnum = ["Female", "Male", "Other"] as const;
export const allergySeverityEnum = ["mild", "moderate", "severe"] as const;
export const problemStatusEnum = ["active", "resolved"] as const;

// Patient Form Validation Schema (create / edit)
export const patientSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(200, "Name is too long"),
  dob: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .refine(
      (val) => {
        // Accepts DD/MM/YYYY or YYYY-MM-DD
        const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
        const yyyymmdd = /^\d{4}-\d{2}-\d{2}$/;
        return ddmmyyyy.test(val) || yyyymmdd.test(val);
      },
      { message: "Date of birth must be DD/MM/YYYY or YYYY-MM-DD" }
    ),
  sex: z.enum(sexEnum, {
    message: "Please select sex (Female, Male, or Other)",
  }),
  phone: z.string().trim().nullable().optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .nullable()
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  address: z.string().trim().nullable().optional(),
});

// Allergy Validation Schema
export const allergySchema = z.object({
  substance: z.string().trim().min(1, "Substance is required").max(100),
  severity: z.enum(allergySeverityEnum, {
    message: "Please select clinical severity",
  }),
  reaction: z.string().trim().nullable().optional(),
});

export const createAllergySchema = allergySchema.extend({
  patientId: z.string().min(1, "Patient ID is required"),
});

// Problem Validation Schema
export const problemSchema = z.object({
  condition: z.string().trim().min(1, "Condition is required").max(200),
  status: z.enum(problemStatusEnum, {
    message: "Status must be active or resolved",
  }).default("active"),
  onsetDate: z.string().trim().nullable().optional(),
});

export const createProblemSchema = problemSchema.extend({
  patientId: z.string().min(1, "Patient ID is required"),
});

// Inferred TypeScript Types
export type PatientInput = z.infer<typeof patientSchema>;
export type AllergyInput = z.infer<typeof allergySchema>;
export type CreateAllergyInput = z.infer<typeof createAllergySchema>;
export type ProblemInput = z.infer<typeof problemSchema>;
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
