import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  appointments,
  patients,
  user,
  allergies,
  type Appointment,
} from "@/lib/db/schema";

export interface AppointmentDetails extends Appointment {
  patient: {
    id: string;
    name: string;
    dob: string;
    phone: string | null;
    hasSevereAllergy?: boolean;
  };
  doctor: {
    id: string;
    name: string;
  };
}

/**
 * List all appointments for a given calendar day within a clinic.
 * Can optionally be filtered by a specific doctorId.
 */
export async function listAppointmentsForDay(
  clinicId: string,
  date: Date | string,
  doctorId?: string
): Promise<AppointmentDetails[]> {
  const targetDate = typeof date === "string" ? new Date(date) : new Date(date.getTime());
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const conditions = [
    eq(appointments.clinicId, clinicId),
    gte(appointments.scheduledAt, startOfDay),
    lte(appointments.scheduledAt, endOfDay),
  ];

  if (doctorId && doctorId.trim()) {
    conditions.push(eq(appointments.doctorId, doctorId.trim()));
  }

  const rows = await db
    .select({
      id: appointments.id,
      clinicId: appointments.clinicId,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      isWalkIn: appointments.isWalkIn,
      reason: appointments.reason,
      createdAt: appointments.createdAt,
      patient: {
        id: patients.id,
        name: patients.name,
        dob: patients.dob,
        phone: patients.phone,
      },
      doctor: {
        id: user.id,
        name: user.name,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(user, eq(appointments.doctorId, user.id))
    .where(and(...conditions))
    .orderBy(asc(appointments.scheduledAt));

  if (rows.length === 0) {
    return [];
  }

  const patientIds = [...new Set(rows.map((r) => r.patient.id))];
  const severeAllergies = await db
    .select({ patientId: allergies.patientId })
    .from(allergies)
    .where(
      and(
        inArray(allergies.patientId, patientIds),
        eq(allergies.severity, "severe")
      )
    );

  const severePatientIds = new Set(severeAllergies.map((a) => a.patientId));

  return rows.map((r) => ({
    ...r,
    patient: {
      ...r.patient,
      hasSevereAllergy: severePatientIds.has(r.patient.id),
    },
  }));
}

/**
 * List all appointments for a specific patient within a clinic,
 * ordered by scheduledAt descending.
 */
export async function listAppointmentsForPatient(
  clinicId: string,
  patientId: string
): Promise<AppointmentDetails[]> {
  const rows = await db
    .select({
      id: appointments.id,
      clinicId: appointments.clinicId,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      isWalkIn: appointments.isWalkIn,
      reason: appointments.reason,
      createdAt: appointments.createdAt,
      patient: {
        id: patients.id,
        name: patients.name,
        dob: patients.dob,
        phone: patients.phone,
      },
      doctor: {
        id: user.id,
        name: user.name,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(user, eq(appointments.doctorId, user.id))
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.patientId, patientId)
      )
    )
    .orderBy(desc(appointments.scheduledAt));

  if (rows.length === 0) {
    return [];
  }

  const severeAllergies = await db
    .select({ id: allergies.id })
    .from(allergies)
    .where(
      and(
        eq(allergies.patientId, patientId),
        eq(allergies.severity, "severe")
      )
    )
    .limit(1);

  const hasSevereAllergy = severeAllergies.length > 0;

  return rows.map((r) => ({
    ...r,
    patient: {
      ...r.patient,
      hasSevereAllergy,
    },
  }));
}

/**
 * Get a single appointment by ID within a clinic, including patient and doctor details.
 */
export async function getAppointment(
  clinicId: string,
  appointmentId: string
): Promise<AppointmentDetails | null> {
  const rows = await db
    .select({
      id: appointments.id,
      clinicId: appointments.clinicId,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      isWalkIn: appointments.isWalkIn,
      reason: appointments.reason,
      createdAt: appointments.createdAt,
      patient: {
        id: patients.id,
        name: patients.name,
        dob: patients.dob,
        phone: patients.phone,
      },
      doctor: {
        id: user.id,
        name: user.name,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(user, eq(appointments.doctorId, user.id))
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.id, appointmentId)
      )
    )
    .limit(1);

  const apt = rows[0];
  if (!apt) {
    return null;
  }

  const severeAllergies = await db
    .select({ id: allergies.id })
    .from(allergies)
    .where(
      and(
        eq(allergies.patientId, apt.patient.id),
        eq(allergies.severity, "severe")
      )
    )
    .limit(1);

  return {
    ...apt,
    patient: {
      ...apt.patient,
      hasSevereAllergy: severeAllergies.length > 0,
    },
  };
}

/**
 * List doctors active in the clinic for populating scheduling selectors.
 */
export async function listClinicDoctors(
  clinicId: string
): Promise<{ id: string; name: string; email: string }[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(and(eq(user.clinicId, clinicId), eq(user.role, "doctor")));
}
