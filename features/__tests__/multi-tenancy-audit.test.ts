import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

// Mock the DB client for unit-level multi-tenancy verification
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    transaction: (fn: (tx: any) => Promise<any>) => mockTransaction(fn),
  },
}));

import { listPatients, getPatient } from "@/features/patients/queries";
import { createPatient, updatePatient, softDeletePatient } from "@/features/patients/mutations";
import { listAppointmentsForDay } from "@/features/appointments/queries";
import { listConsultationsForPatient } from "@/features/consultations/queries";
import { getPrescription } from "@/features/prescriptions/queries";

describe("Multi-Tenancy Audit (Two-Clinic Isolation Unit Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query Tenant Isolation", () => {
    it("listPatients for clinic-a explicitly generates WHERE clinic_id = 'clinic-a'", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        orderBy: vi.fn().mockResolvedValue([
          { id: "pat-1", clinicId: "clinic-a", name: "Patient A", deletedAt: null },
        ]),
      };
      mockSelect.mockReturnValue(chain);

      await listPatients("clinic-a");

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);

      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain("clinic-a");
      expect(params).not.toContain("clinic-b");
    });

    it("getPatient verifies clinic-a boundary and cannot match a patient in clinic-b", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getPatient("clinic-a", "patient-in-clinic-b");
      expect(result).toBeNull();

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { params } = pgDialect.sqlToQuery(whereArg);
      expect(params).toContain("clinic-a");
      expect(params).toContain("patient-in-clinic-b");
    });

    it("listAppointmentsForDay strictly scopes appointments to clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      await listAppointmentsForDay("clinic-a", new Date(), "doctor");

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(params).toContain("clinic-a");
      expect(params).not.toContain("clinic-b");
    });

    it("listConsultationsForPatient enforces clinicId by verifying patient ownership first", async () => {
      // Mock patient ownership check: return empty to simulate cross-tenant access attempt
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]), // Patient not found in clinic-a
      };
      mockSelect.mockReturnValue(chain);

      const result = await listConsultationsForPatient("clinic-a", "patient-in-clinic-b");

      // Cross-tenant patient query returns empty list without querying consultations
      expect(result).toEqual([]);
      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { params } = pgDialect.sqlToQuery(whereArg);
      expect(params).toContain("clinic-a");
    });

    it("getPrescription enforces clinicId in the JOIN/WHERE clause", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getPrescription("clinic-a", "rx-from-clinic-b");
      expect(result).toBeNull();

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain("clinic-a");
    });
  });

  describe("Mutation Tenant Isolation", () => {
    it("createPatient strictly binds the input clinicId to the inserted record", async () => {
      const valuesSpy = vi.fn();
      const chain: any = {
        values: valuesSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([{ id: "new-pat", clinicId: "clinic-a" }]),
      };
      mockInsert.mockReturnValue(chain);

      const result = await createPatient("clinic-a", {
        name: "Test Patient",
        dob: "1990-01-01",
        sex: "Female",
      });

      expect(valuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: "clinic-a",
        })
      );
      expect(result.clinicId).toBe("clinic-a");
    });

    it("updatePatient checks WHERE clinic_id = 'clinic-a' and rejects cross-tenant patient ID", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        set: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([]), // No record updated
      };
      mockUpdate.mockReturnValue(chain);

      await expect(
        updatePatient("clinic-a", "patient-in-clinic-b", { name: "Hijacked Name" })
      ).rejects.toThrow(/not found in clinic/i);

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { params } = pgDialect.sqlToQuery(whereArg);
      expect(params).toContain("clinic-a");
      expect(params).toContain("patient-in-clinic-b");
    });

    it("softDeletePatient sets deletedAt with clinic_id filter and never hard-deletes", async () => {
      const whereSpy = vi.fn();
      const setSpy = vi.fn();
      const chain: any = {
        set: setSpy.mockImplementation(() => chain),
        where: whereSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([{ id: "pat-1", deletedAt: new Date() }]),
      };
      mockUpdate.mockReturnValue(chain);

      await softDeletePatient("clinic-a", "pat-1");

      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        })
      );
      const whereArg = whereSpy.mock.calls[0][0];
      const { params } = pgDialect.sqlToQuery(whereArg);
      expect(params).toContain("clinic-a");
    });
  });
});
