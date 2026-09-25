import { describe, it, expect, expectTypeOf } from "vitest";
import * as schema from "../schema";

describe("Database Schema & ORM", () => {
  describe("Table Exports", () => {
    it("should export all required Auth tables", () => {
      expect(schema.user).toBeDefined();
      expect(schema.session).toBeDefined();
      expect(schema.account).toBeDefined();
      expect(schema.verification).toBeDefined();
    });

    it("should export all required Domain tables", () => {
      expect(schema.clinics).toBeDefined();
      expect(schema.patients).toBeDefined();
      expect(schema.allergies).toBeDefined();
      expect(schema.problems).toBeDefined();
      expect(schema.appointments).toBeDefined();
      expect(schema.consultations).toBeDefined();
      expect(schema.prescriptions).toBeDefined();
      expect(schema.prescriptionItems).toBeDefined();
    });

    it("should export all required Enums", () => {
      expect(schema.allergySeverityEnum).toBeDefined();
      expect(schema.problemStatusEnum).toBeDefined();
      expect(schema.appointmentStatusEnum).toBeDefined();
    });

    it("should export table relations", () => {
      expect(schema.userRelations).toBeDefined();
      expect(schema.sessionRelations).toBeDefined();
      expect(schema.accountRelations).toBeDefined();
      expect(schema.clinicsRelations).toBeDefined();
      expect(schema.patientsRelations).toBeDefined();
      expect(schema.allergiesRelations).toBeDefined();
      expect(schema.problemsRelations).toBeDefined();
      expect(schema.appointmentsRelations).toBeDefined();
      expect(schema.consultationsRelations).toBeDefined();
      expect(schema.prescriptionsRelations).toBeDefined();
      expect(schema.prescriptionItemsRelations).toBeDefined();
    });
  });

  describe("TypeScript Type Definitions", () => {
    it("should resolve correct type shapes for Auth entities", () => {
      expectTypeOf<schema.User>().toHaveProperty("id");
      expectTypeOf<schema.User>().toHaveProperty("email");
      expectTypeOf<schema.User>().toHaveProperty("role");
      expectTypeOf<schema.User>().toHaveProperty("clinicId");

      expectTypeOf<schema.Session>().toHaveProperty("id");
      expectTypeOf<schema.Session>().toHaveProperty("userId");
      expectTypeOf<schema.Session>().toHaveProperty("token");
    });

    it("should resolve correct type shapes for Clinic & Patient entities", () => {
      expectTypeOf<schema.Clinic>().toHaveProperty("id");
      expectTypeOf<schema.Clinic>().toHaveProperty("name");
      expectTypeOf<schema.NewClinic>().toHaveProperty("name");

      expectTypeOf<schema.Patient>().toHaveProperty("id");
      expectTypeOf<schema.Patient>().toHaveProperty("clinicId");
      expectTypeOf<schema.Patient>().toHaveProperty("name");
      expectTypeOf<schema.Patient>().toHaveProperty("dob");
      expectTypeOf<schema.Patient>().toHaveProperty("sex");
      expectTypeOf<schema.NewPatient>().toHaveProperty("name");
      expectTypeOf<schema.NewPatient>().toHaveProperty("clinicId");
    });

    it("should resolve correct type shapes for Clinical records", () => {
      expectTypeOf<schema.Allergy>().toHaveProperty("id");
      expectTypeOf<schema.Allergy>().toHaveProperty("patientId");
      expectTypeOf<schema.Allergy>().toHaveProperty("substance");
      expectTypeOf<schema.Allergy>().toHaveProperty("severity");

      expectTypeOf<schema.Problem>().toHaveProperty("id");
      expectTypeOf<schema.Problem>().toHaveProperty("patientId");
      expectTypeOf<schema.Problem>().toHaveProperty("condition");
      expectTypeOf<schema.Problem>().toHaveProperty("status");

      expectTypeOf<schema.Appointment>().toHaveProperty("id");
      expectTypeOf<schema.Appointment>().toHaveProperty("clinicId");
      expectTypeOf<schema.Appointment>().toHaveProperty("patientId");
      expectTypeOf<schema.Appointment>().toHaveProperty("doctorId");
      expectTypeOf<schema.Appointment>().toHaveProperty("status");

      expectTypeOf<schema.Consultation>().toHaveProperty("id");
      expectTypeOf<schema.Consultation>().toHaveProperty("patientId");
      expectTypeOf<schema.Consultation>().toHaveProperty("doctorId");
      expectTypeOf<schema.Consultation>().toHaveProperty("appointmentId");

      expectTypeOf<schema.Prescription>().toHaveProperty("id");
      expectTypeOf<schema.Prescription>().toHaveProperty("consultationId");

      expectTypeOf<schema.PrescriptionItem>().toHaveProperty("id");
      expectTypeOf<schema.PrescriptionItem>().toHaveProperty("prescriptionId");
      expectTypeOf<schema.PrescriptionItem>().toHaveProperty("medication");
      expectTypeOf<schema.PrescriptionItem>().toHaveProperty("dosage");
    });
  });
});
