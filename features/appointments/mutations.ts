import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  appointments,
  patients,
  user,
  type Appointment,
} from "@/lib/db/schema";
import type {
  AppointmentInput,
  CreateAppointmentInput,
  AppointmentStatus,
} from "./schema";

/**
 * Creates a new scheduled or walk-in appointment scoped to clinicId.
 * Validates that patient belongs to clinic and doctor is an active clinic doctor.
 */
export async function createAppointment(
  clinicId: string,
  input: CreateAppointmentInput
): Promise<Appointment> {
  // 1. Verify patient belongs to clinic and is not soft-deleted
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, input.patientId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!patient) {
    throw new Error(`Patient ${input.patientId} not found in clinic.`);
  }

  // 2. Verify doctor belongs to clinic and has role = 'doctor'
  const [doctor] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.clinicId, clinicId),
        eq(user.id, input.doctorId),
        eq(user.role, "doctor")
      )
    )
    .limit(1);

  if (!doctor) {
    throw new Error(`Doctor ${input.doctorId} not found in clinic.`);
  }

  // 3. Insert appointment scoped to clinicId
  const [created] = await db
    .insert(appointments)
    .values({
      clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt:
        typeof input.scheduledAt === "string"
          ? new Date(input.scheduledAt)
          : input.scheduledAt,
      status: input.status ?? "scheduled",
      isWalkIn: input.isWalkIn ?? false,
      reason: input.reason ?? null,
    })
    .returning();

  return created;
}

/**
 * Updates an existing appointment within clinicId.
 * If patientId or doctorId is changed, enforces clinic boundary checks.
 */
export async function updateAppointment(
  clinicId: string,
  appointmentId: string,
  input: Partial<AppointmentInput>
): Promise<Appointment> {
  // 1. Verify appointment belongs to clinic
  const [existing] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.id, appointmentId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new Error(`Appointment ${appointmentId} not found in clinic.`);
  }

  // 2. If updating patientId, verify patient ownership
  if (input.patientId !== undefined) {
    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(
        and(
          eq(patients.clinicId, clinicId),
          eq(patients.id, input.patientId),
          isNull(patients.deletedAt)
        )
      )
      .limit(1);

    if (!patient) {
      throw new Error(`Patient ${input.patientId} not found in clinic.`);
    }
  }

  // 3. If updating doctorId, verify doctor in clinic
  if (input.doctorId !== undefined) {
    const [doctor] = await db
      .select({ id: user.id })
      .from(user)
      .where(
        and(
          eq(user.clinicId, clinicId),
          eq(user.id, input.doctorId),
          eq(user.role, "doctor")
        )
      )
      .limit(1);

    if (!doctor) {
      throw new Error(`Doctor ${input.doctorId} not found in clinic.`);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (input.patientId !== undefined) updateData.patientId = input.patientId;
  if (input.doctorId !== undefined) updateData.doctorId = input.doctorId;
  if (input.scheduledAt !== undefined) updateData.scheduledAt = input.scheduledAt;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.isWalkIn !== undefined) updateData.isWalkIn = input.isWalkIn;
  if (input.reason !== undefined) updateData.reason = input.reason ?? null;

  const [updated] = await db
    .update(appointments)
    .set(updateData)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.id, appointmentId)
      )
    )
    .returning();

  return updated;
}

/**
 * Updates the clinical status of an appointment within clinicId.
 */
export async function updateAppointmentStatus(
  clinicId: string,
  appointmentId: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const [updated] = await db
    .update(appointments)
    .set({ status })
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.id, appointmentId)
      )
    )
    .returning();

  if (!updated) {
    throw new Error(`Appointment ${appointmentId} not found in clinic.`);
  }

  return updated;
}

/**
 * Immediately registers and checks in an unscheduled walk-in patient.
 * Sets isWalkIn: true, status: 'checked-in', scheduledAt: now().
 */
export async function createWalkInAppointment(
  clinicId: string,
  patientId: string,
  doctorId: string,
  reason?: string
): Promise<Appointment> {
  // 1. Verify patient belongs to clinic and is not soft-deleted
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        eq(patients.id, patientId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!patient) {
    throw new Error(`Patient ${patientId} not found in clinic.`);
  }

  // 2. Verify doctor belongs to clinic and has role = 'doctor'
  const [doctor] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.clinicId, clinicId),
        eq(user.id, doctorId),
        eq(user.role, "doctor")
      )
    )
    .limit(1);

  if (!doctor) {
    throw new Error(`Doctor ${doctorId} not found in clinic.`);
  }

  // 3. Insert walk-in appointment
  const [created] = await db
    .insert(appointments)
    .values({
      clinicId,
      patientId,
      doctorId,
      scheduledAt: new Date(),
      status: "checked-in",
      isWalkIn: true,
      reason: reason ?? "Walk-in consultation",
    })
    .returning();

  return created;
}
