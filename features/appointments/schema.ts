import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { appointments } from "@/lib/db/schema";

// Base Drizzle-Zod Schemas
export const selectAppointmentSchema = createSelectSchema(appointments);
export const insertAppointmentSchema = createInsertSchema(appointments);

// Appointment Status Enum and Type
export const appointmentStatusEnum = [
  "scheduled",
  "checked-in",
  "completed",
  "no-show",
  "cancelled",
] as const;

export type AppointmentStatus = (typeof appointmentStatusEnum)[number];

// Core Appointment Schema
export const appointmentSchema = z.object({
  patientId: z.string().trim().min(1, "Patient is required"),
  doctorId: z.string().trim().min(1, "Doctor is required"),
  scheduledAt: z.union([z.date(), z.string()]).pipe(
    z.coerce.date({
      message: "Valid appointment date and time is required",
    })
  ),
  status: z.enum(appointmentStatusEnum, {
    message: "Invalid appointment status",
  }).default("scheduled"),
  isWalkIn: z.boolean().default(false),
  reason: z.string().trim().max(500, "Reason must be 500 characters or fewer").nullable().optional(),
});

// Specialized Schemas
export const createAppointmentSchema = appointmentSchema;
export const updateAppointmentSchema = appointmentSchema.partial();

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(appointmentStatusEnum, {
    message: "Invalid appointment status",
  }),
});

export const createWalkInSchema = z.object({
  patientId: z.string().trim().min(1, "Patient is required"),
  doctorId: z.string().trim().min(1, "Doctor is required"),
  reason: z.string().trim().max(500, "Reason must be 500 characters or fewer").optional(),
});

// Inferred TypeScript Types
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type CreateAppointmentInput = {
  patientId: string;
  doctorId: string;
  scheduledAt: Date | string;
  status?: AppointmentStatus;
  isWalkIn?: boolean;
  reason?: string | null;
};
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type CreateWalkInInput = z.infer<typeof createWalkInSchema>;
