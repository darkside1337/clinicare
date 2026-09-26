import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import {
  createPatient,
  softDeletePatient,
  createAllergy,
  deleteAllergy,
  createProblem,
} from "../mutations";

describe("features/patients/mutations.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPatient", () => {
    it("inserts clinicId from the parameter, not from any global", async () => {
      const valuesSpy = vi.fn();
      const chain: any = {
        values: valuesSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "pat-new-1",
            clinicId: "clinic-specific-123",
            name: "New Patient",
            dob: "01/01/1990",
            sex: "Female",
          },
        ]),
      };
      mockInsert.mockReturnValue(chain);

      const result = await createPatient("clinic-specific-123", {
        name: "New Patient",
        dob: "01/01/1990",
        sex: "Female",
        phone: "+44 1234567890",
        email: "new@patient.com",
        address: "10 Downing St",
      });

      expect(mockInsert).toHaveBeenCalled();
      expect(valuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: "clinic-specific-123",
          name: "New Patient",
        })
      );
      expect(result.id).toBe("pat-new-1");
    });
  });

  describe("softDeletePatient", () => {
    it("sets deletedAt and does not hard-delete", async () => {
      const setSpy = vi.fn();
      const whereSpy = vi.fn();
      const chain: any = {
        set: setSpy.mockImplementation(() => chain),
        where: whereSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "pat-1",
            clinicId: "clinic-test",
            name: "Deleted Patient",
            deletedAt: new Date(),
          },
        ]),
      };
      mockUpdate.mockReturnValue(chain);

      const result = await softDeletePatient("clinic-test", "pat-1");

      // Verify db.update was called, NOT db.delete
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();

      // Verify set was called with deletedAt timestamp
      expect(setSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        })
      );

      // Verify where was called with clinicId and patientId
      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(sql).toContain('"patients"."id"');
      expect(sql).toContain('"patients"."deleted_at" is null');
      expect(params).toContain("clinic-test");
      expect(params).toContain("pat-1");
      expect(result.deletedAt).toBeDefined();
    });

    it("throws an error if patient is not found", async () => {
      const chain: any = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      mockUpdate.mockReturnValue(chain);

      await expect(
        softDeletePatient("clinic-test", "non-existent")
      ).rejects.toThrow("Patient non-existent not found in clinic.");
    });
  });

  describe("createAllergy", () => {
    it("verifies patient ownership under clinicId before inserting", async () => {
      // 1. Mock select to confirm patient belongs to clinic
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: "pat-1" }]),
      };
      mockSelect.mockReturnValue(selectChain);

      // 2. Mock insert for allergy
      const insertChain: any = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "alg-1",
            patientId: "pat-1",
            substance: "Aspirin",
            severity: "mild",
            reaction: "Nausea",
          },
        ]),
      };
      mockInsert.mockReturnValue(insertChain);

      const result = await createAllergy("clinic-test", {
        patientId: "pat-1",
        substance: "Aspirin",
        severity: "mild",
        reaction: "Nausea",
      });

      expect(mockSelect).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
      expect(result.id).toBe("alg-1");
      expect(result.substance).toBe("Aspirin");
    });

    it("rejects if patient does not belong to clinicId", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // Patient not found in this clinic
      };
      mockSelect.mockReturnValue(selectChain);

      await expect(
        createAllergy("clinic-other", {
          patientId: "pat-foreign",
          substance: "Aspirin",
          severity: "mild",
        })
      ).rejects.toThrow("Patient pat-foreign not found in clinic.");

      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe("deleteAllergy", () => {
    it("verifies allergy belongs to patient in clinicId before deleting", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ allergyId: "alg-123" }]),
      };
      mockSelect.mockReturnValue(selectChain);

      const deleteChain: any = {
        where: vi.fn().mockResolvedValue([{ id: "alg-123" }]),
      };
      mockDelete.mockReturnValue(deleteChain);

      const result = await deleteAllergy("clinic-test", "alg-123");

      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(result.id).toBe("alg-123");
    });

    it("rejects deletion if allergy does not belong to clinicId", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(selectChain);

      await expect(deleteAllergy("clinic-test", "alg-alien")).rejects.toThrow(
        "Allergy alg-alien not found in clinic."
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("createProblem", () => {
    it("verifies patient ownership under clinicId before inserting", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: "pat-1" }]),
      };
      mockSelect.mockReturnValue(selectChain);

      const insertChain: any = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "prb-1",
            patientId: "pat-1",
            condition: "Asthma",
            status: "active",
            onsetDate: "2020",
          },
        ]),
      };
      mockInsert.mockReturnValue(insertChain);

      const result = await createProblem("clinic-test", {
        patientId: "pat-1",
        condition: "Asthma",
        status: "active",
        onsetDate: "2020",
      });

      expect(mockSelect).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
      expect(result.id).toBe("prb-1");
    });
  });
});
