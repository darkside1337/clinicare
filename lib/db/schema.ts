import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user, session, account, verification } from "./auth-schema";

// Re-export all Better Auth tables and relations
export * from "./auth-schema";

// Enums
export const allergySeverityEnum = pgEnum("allergy_severity", [
  "mild",
  "moderate",
  "severe",
]);

export const problemStatusEnum = pgEnum("problem_status", [
  "active",
  "resolved",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "checked-in",
  "completed",
  "no-show",
  "cancelled",
]);

// Domain Tables

export const clinics = pgTable("clinics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patients = pgTable(
  "patients",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dob: text("dob").notNull(),
    sex: text("sex").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("patients_clinic_id_idx").on(table.clinicId)]
);

export const allergies = pgTable(
  "allergies",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    substance: text("substance").notNull(),
    severity: allergySeverityEnum("severity").notNull(),
    reaction: text("reaction"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("allergies_patient_id_idx").on(table.patientId)]
);

export const problems = pgTable(
  "problems",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    condition: text("condition").notNull(),
    status: problemStatusEnum("status").default("active").notNull(),
    onsetDate: text("onset_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("problems_patient_id_idx").on(table.patientId)]
);

export const appointments = pgTable(
  "appointments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    doctorId: text("doctor_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at").notNull(),
    status: appointmentStatusEnum("status").default("scheduled").notNull(),
    isWalkIn: boolean("is_walk_in").default(false).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("appointments_clinic_id_idx").on(table.clinicId),
    index("appointments_patient_id_idx").on(table.patientId),
    index("appointments_doctor_id_idx").on(table.doctorId),
    index("appointments_scheduled_at_idx").on(table.scheduledAt),
  ]
);

export const consultations = pgTable(
  "consultations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    doctorId: text("doctor_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    appointmentId: text("appointment_id")
      .notNull()
      .unique()
      .references(() => appointments.id, { onDelete: "cascade" }),
    chiefComplaint: text("chief_complaint"),
    symptoms: text("symptoms"),
    observations: text("observations"),
    diagnosis: text("diagnosis"),
    treatment: text("treatment"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("consultations_patient_id_idx").on(table.patientId),
    index("consultations_doctor_id_idx").on(table.doctorId),
    uniqueIndex("consultations_appointment_id_idx").on(table.appointmentId),
  ]
);

export const prescriptions = pgTable(
  "prescriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    consultationId: text("consultation_id")
      .notNull()
      .references(() => consultations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("prescriptions_consultation_id_idx").on(table.consultationId)]
);

export const prescriptionItems = pgTable(
  "prescription_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    prescriptionId: text("prescription_id")
      .notNull()
      .references(() => prescriptions.id, { onDelete: "cascade" }),
    medication: text("medication").notNull(),
    dosage: text("dosage").notNull(),
    frequency: text("frequency").notNull(),
    duration: text("duration").notNull(),
    instructions: text("instructions"),
  },
  (table) => [
    index("prescription_items_prescription_id_idx").on(table.prescriptionId),
  ]
);

// Relations

export const clinicsRelations = relations(clinics, ({ many }) => ({
  patients: many(patients),
  appointments: many(appointments),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [patients.clinicId],
    references: [clinics.id],
  }),
  allergies: many(allergies),
  problems: many(problems),
  appointments: many(appointments),
  consultations: many(consultations),
}));

export const allergiesRelations = relations(allergies, ({ one }) => ({
  patient: one(patients, {
    fields: [allergies.patientId],
    references: [patients.id],
  }),
}));

export const problemsRelations = relations(problems, ({ one }) => ({
  patient: one(patients, {
    fields: [problems.patientId],
    references: [patients.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  clinic: one(clinics, {
    fields: [appointments.clinicId],
    references: [clinics.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(user, {
    fields: [appointments.doctorId],
    references: [user.id],
  }),
  consultation: one(consultations, {
    fields: [appointments.id],
    references: [consultations.appointmentId],
  }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, {
    fields: [consultations.patientId],
    references: [patients.id],
  }),
  doctor: one(user, {
    fields: [consultations.doctorId],
    references: [user.id],
  }),
  appointment: one(appointments, {
    fields: [consultations.appointmentId],
    references: [appointments.id],
  }),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  consultation: one(consultations, {
    fields: [prescriptions.consultationId],
    references: [consultations.id],
  }),
  items: many(prescriptionItems),
}));

export const prescriptionItemsRelations = relations(
  prescriptionItems,
  ({ one }) => ({
    prescription: one(prescriptions, {
      fields: [prescriptionItems.prescriptionId],
      references: [prescriptions.id],
    }),
  })
);

// Inferred TypeScript Types
export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Allergy = typeof allergies.$inferSelect;
export type NewAllergy = typeof allergies.$inferInsert;

export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type NewPrescriptionItem = typeof prescriptionItems.$inferInsert;

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
