import { describe, it, expect } from "vitest";
import {
  appointmentSchema,
  updateAppointmentStatusSchema,
  createWalkInSchema,
  appointmentStatusEnum,
} from "../schema";

describe("features/appointments/schema.ts", () => {
  describe("appointmentSchema", () => {
    it("accepts valid appointment data with Date object", () => {
      const valid = {
        patientId: "pat-123",
        doctorId: "doc-456",
        scheduledAt: new Date("2026-09-26T10:00:00Z"),
        status: "scheduled",
        isWalkIn: false,
        reason: "Routine review",
      };

      const result = appointmentSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.patientId).toBe("pat-123");
        expect(result.data.doctorId).toBe("doc-456");
        expect(result.data.status).toBe("scheduled");
        expect(result.data.isWalkIn).toBe(false);
        expect(result.data.reason).toBe("Routine review");
      }
    });

    it("accepts valid appointment data with date string coercion", () => {
      const valid = {
        patientId: "pat-123",
        doctorId: "doc-456",
        scheduledAt: "2026-09-26T14:30:00.000Z",
      };

      const result = appointmentSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.scheduledAt).toBeInstanceOf(Date);
        expect(result.data.status).toBe("scheduled"); // default
        expect(result.data.isWalkIn).toBe(false); // default
      }
    });

    it("accepts all valid appointment statuses", () => {
      for (const status of appointmentStatusEnum) {
        const result = appointmentSchema.safeParse({
          patientId: "pat-1",
          doctorId: "doc-1",
          scheduledAt: new Date(),
          status,
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe(status);
        }
      }
    });

    it("rejects invalid status values", () => {
      const invalid = {
        patientId: "pat-1",
        doctorId: "doc-1",
        scheduledAt: new Date(),
        status: "waiting", // invalid status
      };

      const result = appointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects missing patientId", () => {
      const invalid = {
        patientId: "",
        doctorId: "doc-1",
        scheduledAt: new Date(),
      };

      const result = appointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects missing doctorId", () => {
      const invalid = {
        patientId: "pat-1",
        doctorId: "",
        scheduledAt: new Date(),
      };

      const result = appointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects missing or invalid scheduledAt", () => {
      const missing = {
        patientId: "pat-1",
        doctorId: "doc-1",
      };
      expect(appointmentSchema.safeParse(missing).success).toBe(false);

      const invalidDate = {
        patientId: "pat-1",
        doctorId: "doc-1",
        scheduledAt: "not-a-date",
      };
      expect(appointmentSchema.safeParse(invalidDate).success).toBe(false);
    });
  });

  describe("updateAppointmentStatusSchema", () => {
    it("accepts all valid statuses", () => {
      for (const status of appointmentStatusEnum) {
        const result = updateAppointmentStatusSchema.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid status", () => {
      const result = updateAppointmentStatusSchema.safeParse({ status: "in-progress" });
      expect(result.success).toBe(false);
    });
  });

  describe("createWalkInSchema", () => {
    it("accepts valid walk-in payload without reason", () => {
      const result = createWalkInSchema.safeParse({
        patientId: "pat-1",
        doctorId: "doc-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid walk-in payload with optional reason", () => {
      const result = createWalkInSchema.safeParse({
        patientId: "pat-1",
        doctorId: "doc-1",
        reason: "Emergency cut on finger",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toBe("Emergency cut on finger");
      }
    });

    it("rejects missing patientId or doctorId", () => {
      expect(createWalkInSchema.safeParse({ patientId: "", doctorId: "doc-1" }).success).toBe(false);
      expect(createWalkInSchema.safeParse({ patientId: "pat-1", doctorId: "" }).success).toBe(false);
    });
  });
});
