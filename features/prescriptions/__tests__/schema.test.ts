import { describe, it, expect } from "vitest";
import {
  prescriptionItemSchema,
  createPrescriptionSchema,
} from "../schema";

describe("features/prescriptions/schema.ts", () => {
  describe("prescriptionItemSchema", () => {
    it("validates a complete, valid prescription line item", () => {
      const validItem = {
        medication: "Amoxicillin 500mg",
        dosage: "1 capsule",
        frequency: "Three times daily",
        duration: "7 days",
        instructions: "Take with food",
      };

      const result = prescriptionItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.medication).toBe("Amoxicillin 500mg");
        expect(result.data.dosage).toBe("1 capsule");
        expect(result.data.frequency).toBe("Three times daily");
        expect(result.data.duration).toBe("7 days");
        expect(result.data.instructions).toBe("Take with food");
      }
    });

    it("requires medication name", () => {
      const result = prescriptionItemSchema.safeParse({
        medication: "",
        dosage: "500mg",
        frequency: "TDS",
        duration: "5 days",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("medication"))).toBe(true);
      }
    });

    it("requires dosage", () => {
      const result = prescriptionItemSchema.safeParse({
        medication: "Paracetamol",
        dosage: "   ",
        frequency: "QDS",
        duration: "3 days",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("dosage"))).toBe(true);
      }
    });

    it("requires frequency", () => {
      const result = prescriptionItemSchema.safeParse({
        medication: "Ibuprofen",
        dosage: "400mg",
        frequency: "",
        duration: "5 days",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("frequency"))).toBe(true);
      }
    });

    it("requires duration", () => {
      const result = prescriptionItemSchema.safeParse({
        medication: "Ibuprofen",
        dosage: "400mg",
        frequency: "TDS",
        duration: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("duration"))).toBe(true);
      }
    });

    it("accepts optional or null instructions", () => {
      const withoutInstructions = prescriptionItemSchema.safeParse({
        medication: "Omeprazole",
        dosage: "20mg",
        frequency: "Once daily",
        duration: "28 days",
      });

      expect(withoutInstructions.success).toBe(true);
      if (withoutInstructions.success) {
        expect(withoutInstructions.data.instructions).toBeUndefined();
      }

      const withNullInstructions = prescriptionItemSchema.safeParse({
        medication: "Omeprazole",
        dosage: "20mg",
        frequency: "Once daily",
        duration: "28 days",
        instructions: null,
      });

      expect(withNullInstructions.success).toBe(true);
      if (withNullInstructions.success) {
        expect(withNullInstructions.data.instructions).toBeNull();
      }
    });
  });

  describe("createPrescriptionSchema", () => {
    it("validates a valid prescription with consultationId and items", () => {
      const valid = {
        consultationId: "cns-123",
        items: [
          {
            medication: "Amoxicillin 500mg",
            dosage: "500mg",
            frequency: "Three times daily",
            duration: "7 days",
          },
        ],
      };

      const result = createPrescriptionSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.consultationId).toBe("cns-123");
        expect(result.data.items).toHaveLength(1);
      }
    });

    it("rejects an empty items array", () => {
      const invalid = {
        consultationId: "cns-123",
        items: [],
      };

      const result = createPrescriptionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) =>
              i.path.includes("items") &&
              i.message === "At least one prescription item is required"
          )
        ).toBe(true);
      }
    });

    it("requires consultationId", () => {
      const invalid = {
        consultationId: "   ",
        items: [
          {
            medication: "Amoxicillin",
            dosage: "500mg",
            frequency: "TDS",
            duration: "7d",
          },
        ],
      };

      const result = createPrescriptionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("consultationId"))
        ).toBe(true);
      }
    });
  });
});
