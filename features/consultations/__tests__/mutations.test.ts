import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockTxInsert = vi.fn();
const mockTxUpdate = vi.fn();

const mockTransaction = vi.fn().mockImplementation(async (callback) => {
  return await callback({
    insert: (...args: unknown[]) => mockTxInsert(...args),
    update: (...args: unknown[]) => mockTxUpdate(...args),
  });
});

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    select: (...args: unknown[]) => mockSelect(...args),
    transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

import {
  createConsultation,
  updateConsultation,
} from "../mutations";

describe("features/consultations/mutations.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createConsultation", () => {
    it("sets appointment status to 'completed' in the same transaction", async () => {
      let selectCount = 0;
      const whereSpies: any[] = [];

      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const whereSpy = vi.fn();
        whereSpies.push(whereSpy);

        const chain: any = {
          from: vi.fn().mockReturnThis(),
          where: whereSpy.mockImplementation(() => chain),
          limit: vi.fn().mockImplementation(() => {
            if (current === 1) return Promise.resolve([{ id: "pat-1" }]); // patient check
            if (current === 2) return Promise.resolve([{ id: "doc-1" }]); // doctor check
            if (current === 3) return Promise.resolve([{ id: "apt-1", status: "checked-in" }]); // appointment check
            if (current === 4) return Promise.resolve([]); // existing consultation check (none)
            return Promise.resolve([]);
          }),
        };
        return chain;
      });

      const txInsertValuesSpy = vi.fn();
      const txInsertChain: any = {
        values: txInsertValuesSpy.mockImplementation(() => txInsertChain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "cns-1",
            patientId: "pat-1",
            doctorId: "doc-1",
            appointmentId: "apt-1",
            chiefComplaint: "Severe migraine",
            diagnosis: "Migraine with aura",
          },
        ]),
      };
      mockTxInsert.mockReturnValue(txInsertChain);

      const txUpdateSetSpy = vi.fn();
      const txUpdateWhereSpy = vi.fn();
      const txUpdateChain: any = {
        set: txUpdateSetSpy.mockImplementation(() => txUpdateChain),
        where: txUpdateWhereSpy.mockResolvedValue([]),
      };
      mockTxUpdate.mockReturnValue(txUpdateChain);

      const result = await createConsultation("clinic-test", "doc-1", {
        patientId: "pat-1",
        appointmentId: "apt-1",
        chiefComplaint: "Severe migraine",
        diagnosis: "Migraine with aura",
      });

      // Assert transaction was called
      expect(mockTransaction).toHaveBeenCalled();
      expect(mockTxInsert).toHaveBeenCalled();
      expect(mockTxUpdate).toHaveBeenCalled();

      // Assert appointment status was updated to "completed"
      expect(txUpdateSetSpy).toHaveBeenCalledWith({ status: "completed" });
      expect(result.id).toBe("cns-1");

      // Verify tenant scoping in patient check (first select)
      const patientWhereArg = whereSpies[0].mock.calls[0][0];
      const patientQuery = pgDialect.sqlToQuery(patientWhereArg);
      expect(patientQuery.sql).toContain('"patients"."clinic_id"');
      expect(patientQuery.sql).toContain('"patients"."deleted_at" is null');
      expect(patientQuery.params).toContain("clinic-test");
      expect(patientQuery.params).toContain("pat-1");

      // Verify doctor check (second select)
      const doctorWhereArg = whereSpies[1].mock.calls[0][0];
      const doctorQuery = pgDialect.sqlToQuery(doctorWhereArg);
      expect(doctorQuery.sql).toContain('"user"."clinic_id"');
      expect(doctorQuery.sql).toContain('"user"."role"');
      expect(doctorQuery.params).toContain("clinic-test");
      expect(doctorQuery.params).toContain("doc-1");
      expect(doctorQuery.params).toContain("doctor");
    });

    it("auto-provisions a walk-in appointment if appointmentId is not provided", async () => {
      let selectCount = 0;
      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const chain: any = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(() => {
            if (current === 1) return Promise.resolve([{ id: "pat-1" }]); // patient check
            if (current === 2) return Promise.resolve([{ id: "doc-1" }]); // doctor check
            return Promise.resolve([]);
          }),
        };
        return chain;
      });

      // Mock walk-in appointment insert
      const walkInValuesSpy = vi.fn();
      const insertChain: any = {
        values: walkInValuesSpy.mockImplementation(() => insertChain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "apt-walkin-1",
            clinicId: "clinic-test",
            patientId: "pat-1",
            doctorId: "doc-1",
            isWalkIn: true,
            status: "checked-in",
          },
        ]),
      };
      mockInsert.mockReturnValue(insertChain);

      // Mock tx insert and update
      const txInsertChain: any = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "cns-auto-1",
            patientId: "pat-1",
            doctorId: "doc-1",
            appointmentId: "apt-walkin-1",
            chiefComplaint: "Acute sprain",
          },
        ]),
      };
      mockTxInsert.mockReturnValue(txInsertChain);

      const txUpdateChain: any = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      mockTxUpdate.mockReturnValue(txUpdateChain);

      const result = await createConsultation("clinic-test", "doc-1", {
        patientId: "pat-1",
        chiefComplaint: "Acute sprain",
      });

      expect(mockInsert).toHaveBeenCalled();
      expect(walkInValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: "clinic-test",
          patientId: "pat-1",
          doctorId: "doc-1",
          isWalkIn: true,
          status: "checked-in",
        })
      );
      expect(result.appointmentId).toBe("apt-walkin-1");
    });

    it("throws if patient is not found in clinicId", async () => {
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // patient not found
      };
      mockSelect.mockReturnValue(chain);

      await expect(
        createConsultation("clinic-test", "doc-1", {
          patientId: "pat-nonexistent",
          chiefComplaint: "Fever",
        })
      ).rejects.toThrow("Patient pat-nonexistent not found in clinic.");
    });

    it("throws if doctor is not found or not role doctor", async () => {
      let selectCount = 0;
      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const chain: any = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(() => {
            if (current === 1) return Promise.resolve([{ id: "pat-1" }]); // patient found
            if (current === 2) return Promise.resolve([]); // doctor not found or receptionist
            return Promise.resolve([]);
          }),
        };
        return chain;
      });

      await expect(
        createConsultation("clinic-test", "receptionist-1", {
          patientId: "pat-1",
          chiefComplaint: "Fever",
        })
      ).rejects.toThrow("Doctor receptionist-1 not found in clinic or not authorized.");
    });

    it("throws if appointment is already linked to another consultation", async () => {
      let selectCount = 0;
      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const chain: any = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(() => {
            if (current === 1) return Promise.resolve([{ id: "pat-1" }]);
            if (current === 2) return Promise.resolve([{ id: "doc-1" }]);
            if (current === 3) return Promise.resolve([{ id: "apt-1", status: "completed" }]);
            if (current === 4) return Promise.resolve([{ id: "cns-existing-1" }]); // already has consultation
            return Promise.resolve([]);
          }),
        };
        return chain;
      });

      await expect(
        createConsultation("clinic-test", "doc-1", {
          patientId: "pat-1",
          appointmentId: "apt-1",
          chiefComplaint: "Duplicate test",
        })
      ).rejects.toThrow("already has an associated consultation record");
    });
  });

  describe("updateConsultation", () => {
    it("updates clinical narrative fields when consultation belongs to clinicId", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: "cns-1", patientClinicId: "clinic-test" },
        ]),
      };
      mockSelect.mockReturnValue(selectChain);

      const setSpy = vi.fn();
      const updateChain: any = {
        set: setSpy.mockImplementation(() => updateChain),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "cns-1",
            chiefComplaint: "Updated complaint",
            diagnosis: "Updated diagnosis",
          },
        ]),
      };
      mockUpdate.mockReturnValue(updateChain);

      const result = await updateConsultation("clinic-test", "cns-1", {
        chiefComplaint: "Updated complaint",
        diagnosis: "Updated diagnosis",
      });

      expect(mockSelect).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          chiefComplaint: "Updated complaint",
          diagnosis: "Updated diagnosis",
          updatedAt: expect.any(Date),
        })
      );
      expect(result.chiefComplaint).toBe("Updated complaint");
    });

    it("throws if consultation does not belong to clinic", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(selectChain);

      await expect(
        updateConsultation("clinic-test", "cns-foreign", {
          diagnosis: "Test",
        })
      ).rejects.toThrow("Consultation cns-foreign not found in clinic.");
    });
  });
});
