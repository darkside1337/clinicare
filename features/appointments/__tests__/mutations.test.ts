import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  createWalkInAppointment,
} from "../mutations";

describe("features/appointments/mutations.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAppointment", () => {
    it("verifies patient and doctor exist in clinicId and inserts appointment", async () => {
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

      const valuesSpy = vi.fn();
      const insertChain: any = {
        values: valuesSpy.mockImplementation(() => insertChain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "apt-1",
            clinicId: "clinic-test",
            patientId: "pat-1",
            doctorId: "doc-1",
            scheduledAt: new Date("2026-09-26T10:00:00Z"),
            status: "scheduled",
            isWalkIn: false,
            reason: "General Checkup",
          },
        ]),
      };
      mockInsert.mockReturnValue(insertChain);

      const result = await createAppointment("clinic-test", {
        patientId: "pat-1",
        doctorId: "doc-1",
        scheduledAt: new Date("2026-09-26T10:00:00Z"),
        reason: "General Checkup",
      });

      expect(mockSelect).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalled();
      expect(valuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: "clinic-test",
          patientId: "pat-1",
          doctorId: "doc-1",
          status: "scheduled",
          isWalkIn: false,
          reason: "General Checkup",
        })
      );
      expect(result.id).toBe("apt-1");
    });

    it("throws an error if patient is not found in clinicId", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // patient not found
      };
      mockSelect.mockReturnValue(selectChain);

      await expect(
        createAppointment("clinic-test", {
          patientId: "pat-foreign",
          doctorId: "doc-1",
          scheduledAt: new Date(),
        })
      ).rejects.toThrow("Patient pat-foreign not found in clinic.");

      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("throws an error if doctor is not found in clinicId", async () => {
      let selectCount = 0;
      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const chain: any = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(() => {
            if (current === 1) return Promise.resolve([{ id: "pat-1" }]); // patient found
            return Promise.resolve([]); // doctor not found
          }),
        };
        return chain;
      });

      await expect(
        createAppointment("clinic-test", {
          patientId: "pat-1",
          doctorId: "doc-foreign",
          scheduledAt: new Date(),
        })
      ).rejects.toThrow("Doctor doc-foreign not found in clinic.");

      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe("updateAppointment", () => {
    it("updates appointment only within matching clinicId", async () => {
      const selectChain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: "apt-1" }]),
      };
      mockSelect.mockReturnValue(selectChain);

      const setSpy = vi.fn();
      const whereSpy = vi.fn();
      const updateChain: any = {
        set: setSpy.mockImplementation(() => updateChain),
        where: whereSpy.mockImplementation(() => updateChain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "apt-1",
            clinicId: "clinic-test",
            reason: "Updated reason",
          },
        ]),
      };
      mockUpdate.mockReturnValue(updateChain);

      const result = await updateAppointment("clinic-test", "apt-1", {
        reason: "Updated reason",
      });

      expect(mockSelect).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: "Updated reason",
        })
      );
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(sql).toContain('"appointments"."id"');
      expect(params).toContain("clinic-test");
      expect(params).toContain("apt-1");
      expect(result.reason).toBe("Updated reason");
    });
  });

  describe("updateAppointmentStatus", () => {
    it("updates status column for matching clinicId and appointmentId", async () => {
      const setSpy = vi.fn();
      const whereSpy = vi.fn();
      const updateChain: any = {
        set: setSpy.mockImplementation(() => updateChain),
        where: whereSpy.mockImplementation(() => updateChain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "apt-1",
            clinicId: "clinic-test",
            status: "checked-in",
          },
        ]),
      };
      mockUpdate.mockReturnValue(updateChain);

      const result = await updateAppointmentStatus("clinic-test", "apt-1", "checked-in");

      expect(mockUpdate).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledWith({ status: "checked-in" });
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(sql).toContain('"appointments"."id"');
      expect(params).toContain("clinic-test");
      expect(params).toContain("apt-1");
      expect(result.status).toBe("checked-in");
    });

    it("throws if appointment is not found in clinic", async () => {
      const updateChain: any = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      mockUpdate.mockReturnValue(updateChain);

      await expect(
        updateAppointmentStatus("clinic-test", "non-existent", "completed")
      ).rejects.toThrow("Appointment non-existent not found in clinic.");
    });
  });

  describe("createWalkInAppointment", () => {
    it("sets isWalkIn: true, status: 'checked-in', and scheduledAt: now()", async () => {
      let selectCount = 0;
      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const chain: any = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockImplementation(() => {
            if (current === 1) return Promise.resolve([{ id: "pat-walk" }]);
            if (current === 2) return Promise.resolve([{ id: "doc-walk" }]);
            return Promise.resolve([]);
          }),
        };
        return chain;
      });

      const valuesSpy = vi.fn();
      const insertChain: any = {
        values: valuesSpy.mockImplementation(() => insertChain),
        returning: vi.fn().mockResolvedValue([
          {
            id: "apt-walk-1",
            clinicId: "clinic-test",
            patientId: "pat-walk",
            doctorId: "doc-walk",
            scheduledAt: new Date(),
            status: "checked-in",
            isWalkIn: true,
            reason: "Walk-in consultation",
          },
        ]),
      };
      mockInsert.mockReturnValue(insertChain);

      const result = await createWalkInAppointment("clinic-test", "pat-walk", "doc-walk");

      expect(mockSelect).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalled();
      expect(valuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: "clinic-test",
          patientId: "pat-walk",
          doctorId: "doc-walk",
          isWalkIn: true,
          status: "checked-in",
          scheduledAt: expect.any(Date),
          reason: "Walk-in consultation",
        })
      );
      expect(result.isWalkIn).toBe(true);
      expect(result.status).toBe("checked-in");
    });
  });
});
