import { describe, it, expect } from "vitest";
import {
  consultationSchema,
  createConsultationSchema,
  updateConsultationSchema,
} from "../schema";

describe("features/consultations/schema.ts", () => {
  describe("consultationSchema", () => {
    it("fails when chiefComplaint is missing or empty", () => {
      const result1 = consultationSchema.safeParse({});
      expect(result1.success).toBe(false);

      const result2 = consultationSchema.safeParse({ chiefComplaint: "" });
      expect(result2.success).toBe(false);

      const result3 = consultationSchema.safeParse({ chiefComplaint: "   " });
      expect(result3.success).toBe(false);
    });

    it("succeeds when only chiefComplaint is provided", () => {
      const result = consultationSchema.safeParse({
        chiefComplaint: "Persistent dry cough for 2 weeks",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chiefComplaint).toBe(
          "Persistent dry cough for 2 weeks"
        );
        expect(result.data.symptoms).toBeUndefined();
      }
    });

    it("accepts all 6 free-text clinical fields", () => {
      const payload = {
        chiefComplaint: "Lower back pain radiating down left leg",
        symptoms: "Numbness in L5 dermatome, aggravated by sitting",
        observations: "Straight leg raise positive at 45 degrees left",
        diagnosis: "Lumbar radiculopathy (L4/L5 disc herniation suspected)",
        treatment: "Physiotherapy referral, NSAIDs, posture advice",
        notes: "Safety-netted for cauda equina red flags",
      };

      const result = consultationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(payload);
      }
    });

    it("accepts empty strings for optional fields", () => {
      const payload = {
        chiefComplaint: "Routine follow-up",
        symptoms: "",
        observations: "",
        diagnosis: "",
        treatment: "",
        notes: "",
      };

      const result = consultationSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("createConsultationSchema", () => {
    it("requires patientId and chiefComplaint", () => {
      const noPatient = createConsultationSchema.safeParse({
        chiefComplaint: "Chest tightness",
      });
      expect(noPatient.success).toBe(false);

      const valid = createConsultationSchema.safeParse({
        patientId: "pat-123",
        chiefComplaint: "Chest tightness",
      });
      expect(valid.success).toBe(true);
    });

    it("accepts optional appointmentId", () => {
      const withAppt = createConsultationSchema.safeParse({
        patientId: "pat-123",
        appointmentId: "apt-456",
        chiefComplaint: "Headache",
      });
      expect(withAppt.success).toBe(true);
      if (withAppt.success) {
        expect(withAppt.data.appointmentId).toBe("apt-456");
      }
    });
  });

  describe("updateConsultationSchema", () => {
    it("allows updating partial fields without chiefComplaint", () => {
      const result = updateConsultationSchema.safeParse({
        diagnosis: "Updated clinical impression",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.diagnosis).toBe("Updated clinical impression");
      }
    });

    it("accepts empty object for no-op update", () => {
      const result = updateConsultationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
