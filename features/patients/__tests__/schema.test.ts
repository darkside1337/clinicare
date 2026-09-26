import { describe, it, expect } from "vitest";
import {
  patientSchema,
  allergySchema,
  problemSchema,
} from "../schema";

describe("features/patients/schema.ts", () => {
  describe("patientSchema", () => {
    it("accepts valid patient data with DD/MM/YYYY date format", () => {
      const valid = {
        name: "Jane Doe",
        dob: "15/04/1985",
        sex: "Female",
        phone: "+44 7700 900123",
        email: "jane.doe@example.com",
        address: "12 High Street, Edinburgh",
      };

      const result = patientSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Jane Doe");
        expect(result.data.sex).toBe("Female");
      }
    });

    it("accepts valid patient data with YYYY-MM-DD date format", () => {
      const valid = {
        name: "John Smith",
        dob: "1980-11-20",
        sex: "Male",
        phone: null,
        email: "",
        address: null,
      };

      const result = patientSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("");
      }
    });

    it("rejects missing name", () => {
      const invalid = {
        dob: "15/04/1985",
        sex: "Female",
      };

      const result = patientSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects missing dob", () => {
      const invalid = {
        name: "Jane Doe",
        sex: "Female",
      };

      const result = patientSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const invalid = {
        name: "Jane Doe",
        dob: "invalid-date",
        sex: "Female",
      };

      const result = patientSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid sex value", () => {
      const invalid = {
        name: "Jane Doe",
        dob: "15/04/1985",
        sex: "Unknown",
      };

      const result = patientSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", () => {
      const invalid = {
        name: "Jane Doe",
        dob: "15/04/1985",
        sex: "Female",
        email: "not-an-email",
      };

      const result = patientSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("allergySchema", () => {
    it("accepts valid allergy with mild severity", () => {
      const result = allergySchema.safeParse({
        substance: "Amoxicillin",
        severity: "mild",
        reaction: "Mild skin rash",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid allergy with severe severity", () => {
      const result = allergySchema.safeParse({
        substance: "Penicillin",
        severity: "severe",
        reaction: "Anaphylaxis",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid severity value", () => {
      const result = allergySchema.safeParse({
        substance: "Peanuts",
        severity: "critical", // invalid enum
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing substance", () => {
      const result = allergySchema.safeParse({
        severity: "moderate",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("problemSchema", () => {
    it("accepts valid active problem", () => {
      const result = problemSchema.safeParse({
        condition: "Essential Hypertension",
        status: "active",
        onsetDate: "2021",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid resolved problem", () => {
      const result = problemSchema.safeParse({
        condition: "Acute Bronchitis",
        status: "resolved",
      });
      expect(result.success).toBe(true);
    });

    it("defaults status to active if omitted", () => {
      const result = problemSchema.safeParse({
        condition: "Type 2 Diabetes",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("active");
      }
    });

    it("rejects invalid problem status", () => {
      const result = problemSchema.safeParse({
        condition: "Asthma",
        status: "chronic", // invalid enum
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing condition", () => {
      const result = problemSchema.safeParse({
        status: "active",
      });
      expect(result.success).toBe(false);
    });
  });
});
