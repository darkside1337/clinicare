import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  consultations,
  patients,
  appointments,
  user,
  prescriptions,
  prescriptionItems,
  type Consultation,
} from "@/lib/db/schema";
import type {
  CreateConsultationInput,
  UpdateConsultationInput,
} from "./schema";

/**
 * Creates a consultation record linked to an appointment, practitioner, and patient.
 * Atomically marks the appointment status as 'completed' in the same transaction.
 * If no appointmentId is provided, auto-provisions a walk-in appointment record.
 */
export async function createConsultation(
  clinicId: string,
  doctorId: string,
  input: CreateConsultationInput
): Promise<Consultation> {
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
        eq(user.id, doctorId),
        eq(user.role, "doctor")
      )
    )
    .limit(1);

  if (!doctor) {
    throw new Error(`Doctor ${doctorId} not found in clinic or not authorized.`);
  }

  // 3. Resolve appointment ID
  let resolvedAppointmentId = input.appointmentId;

  if (resolvedAppointmentId) {
    // Verify appointment belongs to clinic and patient
    const [appointment] = await db
      .select({ id: appointments.id, status: appointments.status })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          eq(appointments.id, resolvedAppointmentId),
          eq(appointments.patientId, input.patientId)
        )
      )
      .limit(1);

    if (!appointment) {
      throw new Error(
        `Appointment ${resolvedAppointmentId} not found for patient ${input.patientId} in this clinic.`
      );
    }

    // Verify appointment does not already have an associated consultation
    const [existingConsultation] = await db
      .select({ id: consultations.id })
      .from(consultations)
      .where(eq(consultations.appointmentId, resolvedAppointmentId))
      .limit(1);

    if (existingConsultation) {
      throw new Error(
        `Appointment ${resolvedAppointmentId} already has an associated consultation record (${existingConsultation.id}).`
      );
    }
  } else {
    // Auto-create walk-in appointment
    const [walkIn] = await db
      .insert(appointments)
      .values({
        clinicId,
        patientId: input.patientId,
        doctorId,
        scheduledAt: new Date(),
        status: "checked-in",
        isWalkIn: true,
        reason: input.chiefComplaint ?? "Walk-in consultation",
      })
      .returning();

    resolvedAppointmentId = walkIn.id;
  }

  // 4. Execute creation and appointment status completion in a single transaction
  return await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(consultations)
      .values({
        patientId: input.patientId,
        doctorId,
        appointmentId: resolvedAppointmentId!,
        chiefComplaint: input.chiefComplaint,
        symptoms: input.symptoms || null,
        observations: input.observations || null,
        diagnosis: input.diagnosis || null,
        treatment: input.treatment || null,
        notes: input.notes || null,
      })
      .returning();

    await tx
      .update(appointments)
      .set({ status: "completed" })
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          eq(appointments.id, resolvedAppointmentId!)
        )
      );

    // Atomically persist attached prescription order if items were provided
    if (input.prescriptionItems && input.prescriptionItems.length > 0) {
      const [newPrescription] = await tx
        .insert(prescriptions)
        .values({
          consultationId: created.id,
        })
        .returning();

      await tx.insert(prescriptionItems).values(
        input.prescriptionItems.map((item) => ({
          prescriptionId: newPrescription.id,
          medication: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || null,
        }))
      );
    }

    return created;
  });
}

/**
 * Updates clinical narrative fields on an existing consultation record.
 * Enforces tenant boundary by verifying patient clinic ownership.
 */
export async function updateConsultation(
  clinicId: string,
  consultationId: string,
  input: UpdateConsultationInput
): Promise<Consultation> {
  // 1. Verify consultation belongs to clinic via patient join
  const [existing] = await db
    .select({
      id: consultations.id,
      patientClinicId: patients.clinicId,
    })
    .from(consultations)
    .innerJoin(patients, eq(consultations.patientId, patients.id))
    .where(
      and(
        eq(consultations.id, consultationId),
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    throw new Error(
      `Consultation ${consultationId} not found in clinic.`
    );
  }

  // 2. Prepare update payload
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.chiefComplaint !== undefined) {
    updateData.chiefComplaint = input.chiefComplaint;
  }
  if (input.symptoms !== undefined) {
    updateData.symptoms = input.symptoms || null;
  }
  if (input.observations !== undefined) {
    updateData.observations = input.observations || null;
  }
  if (input.diagnosis !== undefined) {
    updateData.diagnosis = input.diagnosis || null;
  }
  if (input.treatment !== undefined) {
    updateData.treatment = input.treatment || null;
  }
  if (input.notes !== undefined) {
    updateData.notes = input.notes || null;
  }

  const [updated] = await db
    .update(consultations)
    .set(updateData)
    .where(
      and(
        eq(consultations.id, consultationId),
        inArray(
          consultations.patientId,
          db
            .select({ id: patients.id })
            .from(patients)
            .where(
              and(
                eq(patients.clinicId, clinicId),
                isNull(patients.deletedAt)
              )
            )
        )
      )
    )
    .returning();

  return updated;
}
