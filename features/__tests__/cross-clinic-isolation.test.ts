/**
 * Scope note: These mocked-SQL unit tests prove that tenant predicates (clinicId = "clinic-a")
 * are strictly generated for all clinical operations, preventing cross-tenant access. They verify
 * that client-supplied IDs from clinic-b cannot bypass tenant boundaries. PostgreSQL-level
 * isolation and RLS are verified in E2E/integration tests.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const pgDialect = new PgDialect();
const fakePg = postgres("postgres://fake:fake@localhost:5432/fake");
const realDrizzle = drizzle(fakePg);

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
import {
  updatePatient,
  softDeletePatient,
  updateAllergy,
  deleteAllergy,
  updateProblem,
} from "@/features/patients/mutations";
import { getAppointment } from "@/features/appointments/queries";
import { updateAppointmentStatus } from "@/features/appointments/mutations";
import { listConsultationsForPatient } from "@/features/consultations/queries";
import { updateConsultation } from "@/features/consultations/mutations";
import { getPrescription } from "@/features/prescriptions/queries";
import { createPrescription } from "@/features/prescriptions/mutations";

describe("Cross-Clinic Isolation Tests (clinic-a session vs valid clinic-b records)", () => {
  const sessionClinicId = "clinic-a";
  const foreignClinicId = "clinic-b";

  // Fixtures representing valid records residing in clinic-b
  const foreignRecords = {
    patientId: "pat-in-clinic-b",
    appointmentId: "apt-in-clinic-b",
    consultationId: "cns-in-clinic-b",
    prescriptionId: "rx-in-clinic-b",
    allergyId: "alg-in-clinic-b",
    problemId: "prb-in-clinic-b",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Patient domain isolation", () => {
    it("getPatient with clinic-a session and clinic-b patient ID yields null and filters by clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]), // No record found in clinic-a
      };
      mockSelect.mockReturnValue(chain);

      const result = await getPatient(sessionClinicId, foreignRecords.patientId);

      expect(result).toBeNull();
      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });

    it("updatePatient with clinic-a session rejects clinic-b patient ID and filters by clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        set: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([]), // No row updated in clinic-a
      };
      mockUpdate.mockReturnValue(chain);

      await expect(
        updatePatient(sessionClinicId, foreignRecords.patientId, { name: "Tampered Name" })
      ).rejects.toThrow(`Patient ${foreignRecords.patientId} not found in clinic.`);

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });

    it("softDeletePatient with clinic-a session rejects clinic-b patient ID and filters by clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        set: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([]),
      };
      mockUpdate.mockReturnValue(chain);

      await expect(
        softDeletePatient(sessionClinicId, foreignRecords.patientId)
      ).rejects.toThrow(`Patient ${foreignRecords.patientId} not found in clinic.`);

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });

    it("listPatients for clinic-a explicitly generates WHERE clinic_id = clinic-a and caps to 100", async () => {
      const whereSpy = vi.fn();
      const limitSpy = vi.fn().mockResolvedValue([
        { id: "pat-a-1", clinicId: sessionClinicId, name: "Clinic A Patient" },
      ]);
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        orderBy: vi.fn().mockReturnThis(),
        limit: limitSpy,
      };
      mockSelect.mockReturnValue(chain);

      const result = await listPatients(sessionClinicId);

      expect(result).toHaveLength(1);
      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
      expect(limitSpy).toHaveBeenCalledWith(100);
    });
  });

  describe("Appointment domain isolation", () => {
    it("getAppointment with clinic-a session yields null for clinic-b appointment ID and filters by clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getAppointment(sessionClinicId, foreignRecords.appointmentId);

      expect(result).toBeNull();
      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });

    it("updateAppointmentStatus with clinic-a session rejects clinic-b appointment ID and filters by clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        set: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        returning: vi.fn().mockResolvedValue([]),
      };
      mockUpdate.mockReturnValue(chain);

      await expect(
        updateAppointmentStatus(sessionClinicId, foreignRecords.appointmentId, "cancelled")
      ).rejects.toThrow(`Appointment ${foreignRecords.appointmentId} not found in clinic.`);

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });
  });

  describe("Consultation domain isolation", () => {
    it("updateConsultation with clinic-a session rejects clinic-b consultation ID and filters by clinic-a", async () => {
      const selectWhereSpy = vi.fn();
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: selectWhereSpy.mockImplementation(() => selectChain),
        limit: vi.fn().mockResolvedValue([]), // Foreign consultation not found in clinic-a
      };
      mockSelect.mockReturnValue(selectChain);

      await expect(
        updateConsultation(sessionClinicId, foreignRecords.consultationId, {
          chiefComplaint: "Unauthorized update",
        })
      ).rejects.toThrow(`Consultation ${foreignRecords.consultationId} not found in clinic.`);

      expect(selectWhereSpy).toHaveBeenCalled();
      const selectWhereArg = selectWhereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(selectWhereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });

    it("listConsultationsForPatient returns empty list and scopes patient lookup to clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await listConsultationsForPatient(sessionClinicId, foreignRecords.patientId);

      expect(result).toEqual([]);
      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });
  });

  describe("Prescription domain isolation", () => {
    it("getPrescription with clinic-a session yields null for clinic-b prescription and enforces patients.clinicId = clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getPrescription(sessionClinicId, foreignRecords.prescriptionId);

      expect(result).toBeNull();
      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });

    it("createPrescription with clinic-a session rejects consultation in clinic-b and scopes lookup to clinic-a", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      await expect(
        createPrescription(sessionClinicId, {
          consultationId: foreignRecords.consultationId,
          items: [
            {
              medication: "Paracetamol",
              dosage: "500mg",
              frequency: "QDS",
              duration: "3 days",
            },
          ],
        })
      ).rejects.toThrow(`Consultation ${foreignRecords.consultationId} not found in clinic or not authorized.`);

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });
  });

  describe("Allergy domain isolation & atomic write predicate assertions", () => {
    it("updateAllergy rejects clinic-b allergy ID and verifies clinic-a predicate in pre-check and final UPDATE", async () => {
      // 1. Initial rejection when allergy is not in clinic-a
      const preCheckWhereSpy = vi.fn();
      const preCheckChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: preCheckWhereSpy.mockImplementation(() => preCheckChain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(preCheckChain);

      await expect(
        updateAllergy(sessionClinicId, foreignRecords.allergyId, { substance: "Peanuts" })
      ).rejects.toThrow(`Allergy ${foreignRecords.allergyId} not found in clinic.`);

      const preCheckArg = preCheckWhereSpy.mock.calls[0][0];
      expect(pgDialect.sqlToQuery(preCheckArg).params).toContain(sessionClinicId);

      // 2. Final-write predicate assertion: even if pre-check returned a record, final UPDATE must contain clinic-a
      preCheckChain.limit.mockResolvedValueOnce([{ allergyId: foreignRecords.allergyId }]);
      let selectCount = 0;
      mockSelect.mockImplementation((...args: any[]) => {
        selectCount++;
        if (selectCount === 1) return preCheckChain;
        return (realDrizzle.select as any)(...args);
      });

      const updateWhereSpy = vi.fn();
      const updateChain: any = {
        set: vi.fn().mockReturnThis(),
        where: updateWhereSpy.mockImplementation(() => updateChain),
        returning: vi.fn().mockResolvedValue([{ id: foreignRecords.allergyId }]),
      };
      mockUpdate.mockReturnValue(updateChain);

      await updateAllergy(sessionClinicId, foreignRecords.allergyId, { substance: "Peanuts" });

      expect(updateWhereSpy).toHaveBeenCalled();
      const updateWhereArg = updateWhereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(updateWhereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });

    it("deleteAllergy rejects clinic-b allergy ID and verifies clinic-a predicate in pre-check and final DELETE", async () => {
      // 1. Initial rejection when allergy is not in clinic-a
      const preCheckWhereSpy = vi.fn();
      const preCheckChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: preCheckWhereSpy.mockImplementation(() => preCheckChain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(preCheckChain);

      await expect(
        deleteAllergy(sessionClinicId, foreignRecords.allergyId)
      ).rejects.toThrow(`Allergy ${foreignRecords.allergyId} not found in clinic.`);

      const preCheckArg = preCheckWhereSpy.mock.calls[0][0];
      expect(pgDialect.sqlToQuery(preCheckArg).params).toContain(sessionClinicId);

      // 2. Final-write predicate assertion: final DELETE statement strictly filters by clinic-a
      preCheckChain.limit.mockResolvedValueOnce([{ allergyId: foreignRecords.allergyId }]);
      let selectCount = 0;
      mockSelect.mockImplementation((...args: any[]) => {
        selectCount++;
        if (selectCount === 1) return preCheckChain;
        return (realDrizzle.select as any)(...args);
      });

      const deleteWhereSpy = vi.fn();
      const deleteChain: any = {
        where: deleteWhereSpy.mockResolvedValue([{ id: foreignRecords.allergyId }]),
      };
      mockDelete.mockReturnValue(deleteChain);

      await deleteAllergy(sessionClinicId, foreignRecords.allergyId);

      expect(deleteWhereSpy).toHaveBeenCalled();
      const deleteWhereArg = deleteWhereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(deleteWhereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });
  });

  describe("Problem domain isolation & atomic write predicate assertion", () => {
    it("updateProblem rejects clinic-b problem ID and verifies clinic-a predicate in pre-check and final UPDATE", async () => {
      const preCheckWhereSpy = vi.fn();
      const preCheckChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: preCheckWhereSpy.mockImplementation(() => preCheckChain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(preCheckChain);

      await expect(
        updateProblem(sessionClinicId, foreignRecords.problemId, { status: "resolved" })
      ).rejects.toThrow(`Problem ${foreignRecords.problemId} not found in clinic.`);

      const preCheckArg = preCheckWhereSpy.mock.calls[0][0];
      expect(pgDialect.sqlToQuery(preCheckArg).params).toContain(sessionClinicId);

      // Final-write predicate assertion
      preCheckChain.limit.mockResolvedValueOnce([{ problemId: foreignRecords.problemId }]);
      let selectCount = 0;
      mockSelect.mockImplementation((...args: any[]) => {
        selectCount++;
        if (selectCount === 1) return preCheckChain;
        return (realDrizzle.select as any)(...args);
      });

      const updateWhereSpy = vi.fn();
      const updateChain: any = {
        set: vi.fn().mockReturnThis(),
        where: updateWhereSpy.mockImplementation(() => updateChain),
        returning: vi.fn().mockResolvedValue([{ id: foreignRecords.problemId }]),
      };
      mockUpdate.mockReturnValue(updateChain);

      await updateProblem(sessionClinicId, foreignRecords.problemId, { status: "resolved" });

      expect(updateWhereSpy).toHaveBeenCalled();
      const updateWhereArg = updateWhereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(updateWhereArg);
      expect(sql).toContain('"patients"."clinic_id"');
      expect(params).toContain(sessionClinicId);
      expect(params).not.toContain(foreignClinicId);
    });
  });
});
