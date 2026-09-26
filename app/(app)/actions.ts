"use server";

import { getSession } from "@/lib/auth/session";
import { requireDoctor } from "@/lib/auth/require-doctor";
import { listPatients } from "@/features/patients/queries";
import { createWalkInAppointment } from "@/features/appointments/mutations";

export interface CommandPalettePatientResult {
  id: string;
  name: string;
  dob: string;
  sex: string;
  phone: string | null;
  email: string | null;
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Searches patients by query string scoped strictly to the authenticated user's clinicId.
 */
export async function searchPatientsAction(
  query: string
): Promise<CommandPalettePatientResult[]> {
  const session = await getSession();
  const cleanQuery = query?.trim() ?? "";
  if (!cleanQuery) {
    return [];
  }

  const patientRows = await listPatients(session.clinicId, cleanQuery);

  return patientRows.map((p) => ({
    id: p.id,
    name: p.name,
    dob: p.dob,
    sex: p.sex,
    phone: p.phone,
    email: p.email,
  }));
}

export interface StartWalkInResult {
  appointmentId: string;
  redirectUrl: string;
}

/**
 * Creates an immediate walk-in appointment and returns the target consultation URL.
 * Doctor-only action; throws ForbiddenError if called by a non-doctor.
 */
export async function startWalkInConsultationAction(
  patientId: string
): Promise<ActionResult<StartWalkInResult>> {
  try {
    const session = await requireDoctor();
    if (!patientId) {
      return { success: false, error: "Patient ID is required." };
    }

    const appointment = await createWalkInAppointment(
      session.clinicId,
      patientId,
      session.user.id,
      "Walk-in consultation via Command Palette"
    );

    return {
      success: true,
      data: {
        appointmentId: appointment.id,
        redirectUrl: `/patients/${patientId}/consultations/new?appointmentId=${appointment.id}`,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start walk-in consultation.",
    };
  }
}
