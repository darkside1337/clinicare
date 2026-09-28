"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/action-result";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
  createWalkInSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type CreateWalkInInput,
  type AppointmentStatus,
} from "@/features/appointments/schema";
import {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  createWalkInAppointment,
} from "@/features/appointments/mutations";
import type { Appointment } from "@/lib/db/schema";

/**
 * Server Action to schedule a new appointment.
 * Resolves session, validates with createAppointmentSchema, invokes createAppointment mutation.
 */
export async function createAppointmentAction(
  input: CreateAppointmentInput
): Promise<ActionResult<Appointment>> {
  const session = await getSession();

  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const appointment = await createAppointment(session.clinicId, parsed.data);
    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true, data: appointment };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to schedule appointment. Please try again.",
    };
  }
}

/**
 * Server Action to update clinical appointment status.
 */
export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionResult<Appointment>> {
  const session = await getSession();

  const parsed = updateAppointmentStatusSchema.safeParse({ status });
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const appointment = await updateAppointmentStatus(
      session.clinicId,
      appointmentId,
      parsed.data.status
    );
    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true, data: appointment };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update appointment status. Please try again.",
    };
  }
}

/**
 * Server Action to immediately register and check in a walk-in patient.
 */
export async function createWalkInAppointmentAction(
  input: CreateWalkInInput
): Promise<ActionResult<Appointment>> {
  const session = await getSession();

  const parsed = createWalkInSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const appointment = await createWalkInAppointment(
      session.clinicId,
      parsed.data.patientId,
      parsed.data.doctorId,
      parsed.data.reason
    );
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    revalidatePath(`/patients/${parsed.data.patientId}`);

    return { success: true, data: appointment };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to register walk-in patient. Please try again.",
    };
  }
}

/**
 * Server Action to update appointment details.
 */
export async function updateAppointmentAction(
  appointmentId: string,
  input: UpdateAppointmentInput
): Promise<ActionResult<Appointment>> {
  const session = await getSession();

  const parsed = updateAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    const appointment = await updateAppointment(
      session.clinicId,
      appointmentId,
      parsed.data
    );
    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true, data: appointment };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update appointment. Please try again.",
    };
  }
}
