import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

const mockSelect = vi.fn();

vi.mock("@/lib/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import {
  getPrescription,
  listPrescriptionsForConsultation,
  listPrescriptionsForPatient,
  calculateAge,
} from "../queries";

describe("features/prescriptions/queries.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateAge", () => {
    it("calculates age accurately from YYYY-MM-DD format", () => {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - 30;
      const age = calculateAge(`${birthYear}-01-01`);
      expect(age).toBeGreaterThanOrEqual(29);
      expect(age).toBeLessThanOrEqual(30);
    });

    it("calculates age accurately from DD/MM/YYYY format", () => {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - 45;
      const age = calculateAge(`15/05/${birthYear}`);
      expect(age).toBeGreaterThanOrEqual(44);
      expect(age).toBeLessThanOrEqual(45);
    });

    it("returns 0 for empty or invalid DOB string", () => {
      expect(calculateAge("")).toBe(0);
      expect(calculateAge("invalid-date")).toBe(0);
    });
  });

  describe("getPrescription", () => {
    it("returns null when prescription does not exist or clinicId does not match", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getPrescription("clinic-alpha", "rx-nonexistent");
      expect(result).toBeNull();

      expect(whereSpy).toHaveBeenCalledTimes(1);
      const whereClause = whereSpy.mock.calls[0][0];
      const sql = pgDialect.sqlToQuery(whereClause.getSQL()).sql;
      expect(sql).toContain('"prescriptions"."id" = $1');
      expect(sql).toContain('"patients"."clinic_id" = $2');
      expect(sql).toContain('"patients"."deleted_at" is null');
    });

    it("resolves full prescription details with line items and patient demographics", async () => {
      let selectCount = 0;
      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;

        if (current === 1) {
          // Prescription + joins query
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([
              {
                id: "rx-101",
                consultationId: "cns-201",
                createdAt: new Date("2026-09-26T10:00:00Z"),
                patientId: "pat-301",
                patientName: "Jane Doe",
                patientDob: "1990-05-15",
                patientSex: "Female",
                patientAddress: "123 High St, London",
                patientPhone: "+44 7700 900123",
                patientEmail: "jane.doe@example.com",
                doctorId: "doc-401",
                doctorName: "Dr. Gregory House",
                doctorEmail: "house@clinic.com",
                clinicId: "clinic-1",
                clinicName: "London Central Clinic",
                clinicAddress: "1 Medical Way, London",
                clinicLogoUrl: "https://example.com/logo.png",
                consultationChiefComplaint: "Severe persistent cough",
                consultationDiagnosis: "Acute Bronchitis",
                consultationCreatedAt: new Date("2026-09-26T09:30:00Z"),
              },
            ]),
          };
          return chain;
        }

        if (current === 2) {
          // Items query
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([
              {
                id: "item-1",
                prescriptionId: "rx-101",
                medication: "Amoxicillin 500mg",
                dosage: "500mg",
                frequency: "TDS",
                duration: "7 days",
                instructions: "Take with food",
              },
            ]),
          };
          return chain;
        }

        return { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };
      });

      const result = await getPrescription("clinic-1", "rx-101");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("rx-101");
      expect(result?.patient.name).toBe("Jane Doe");
      expect(result?.patient.age).toBeGreaterThan(0);
      expect(result?.doctor.name).toBe("Dr. Gregory House");
      expect(result?.clinic.name).toBe("London Central Clinic");
      expect(result?.items).toHaveLength(1);
      expect(result?.items[0].medication).toBe("Amoxicillin 500mg");
    });
  });

  describe("listPrescriptionsForConsultation", () => {
    it("returns empty array if consultation does not belong to clinic", async () => {
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await listPrescriptionsForConsultation(
        "clinic-other",
        "cns-unauthorized"
      );
      expect(result).toEqual([]);
    });

    it("returns all prescriptions with mapped items ordered by newest first", async () => {
      let selectCount = 0;
      const orderBySpy = vi.fn();

      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;

        if (current === 1) {
          // Verification
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([{ id: "cns-1" }]),
          };
          return chain;
        }

        if (current === 2) {
          // Prescriptions query
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: orderBySpy.mockResolvedValue([
              {
                id: "rx-newer",
                consultationId: "cns-1",
                createdAt: new Date("2026-09-26T14:00:00Z"),
              },
              {
                id: "rx-older",
                consultationId: "cns-1",
                createdAt: new Date("2026-09-26T11:00:00Z"),
              },
            ]),
          };
          return chain;
        }

        if (current === 3) {
          // Prescription items batch query
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([
              {
                id: "item-1",
                prescriptionId: "rx-newer",
                medication: "Hydrocortisone cream 1%",
                dosage: "Apply thinly",
                frequency: "BD",
                duration: "14 days",
                instructions: null,
              },
              {
                id: "item-2",
                prescriptionId: "rx-older",
                medication: "Cetirizine 10mg",
                dosage: "10mg",
                frequency: "OD",
                duration: "30 days",
                instructions: "Take at night",
              },
            ]),
          };
          return chain;
        }

        return { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };
      });

      const list = await listPrescriptionsForConsultation("clinic-1", "cns-1");
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe("rx-newer");
      expect(list[0].items).toHaveLength(1);
      expect(list[0].items[0].medication).toBe("Hydrocortisone cream 1%");
      expect(list[1].id).toBe("rx-older");
      expect(list[1].items).toHaveLength(1);
      expect(list[1].items[0].medication).toBe("Cetirizine 10mg");
    });
  });

  describe("listPrescriptionsForPatient", () => {
    it("returns empty array if patient is not in clinic", async () => {
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const list = await listPrescriptionsForPatient("clinic-1", "pat-missing");
      expect(list).toEqual([]);
    });

    it("queries prescriptions joined through consultations and maps items", async () => {
      let selectCount = 0;

      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;

        if (current === 1) {
          // Patient check
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([{ id: "pat-1" }]),
          };
          return chain;
        }

        if (current === 2) {
          // Prescriptions
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "rx-pat-1",
                consultationId: "cns-10",
                createdAt: new Date(),
              },
            ]),
          };
          return chain;
        }

        if (current === 3) {
          // Items
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([
              {
                id: "item-pat-1",
                prescriptionId: "rx-pat-1",
                medication: "Salbutamol 100mcg Inhaler",
                dosage: "2 puffs",
                frequency: "PRN",
                duration: "1 inhaler",
                instructions: "As required for wheeze",
              },
            ]),
          };
          return chain;
        }

        return { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };
      });

      const list = await listPrescriptionsForPatient("clinic-1", "pat-1");
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("rx-pat-1");
      expect(list[0].items[0].medication).toBe("Salbutamol 100mcg Inhaler");
    });
  });
});
