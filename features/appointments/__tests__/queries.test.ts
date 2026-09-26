import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

// Mock the DB client
const mockSelect = vi.fn();

vi.mock("@/lib/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import {
  listAppointmentsForDay,
  listAppointmentsForPatient,
  getAppointment,
  listClinicDoctors,
} from "../queries";

describe("features/appointments/queries.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAppointmentsForDay", () => {
    it("filters by clinicId and date range (start of day to end of day)", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await listAppointmentsForDay("clinic-test", "2026-09-26");

      expect(mockSelect).toHaveBeenCalled();
      expect(chain.from).toHaveBeenCalled();
      expect(whereSpy).toHaveBeenCalled();
      expect(result).toEqual([]);

      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(sql).toContain('"appointments"."scheduled_at" >=');
      expect(sql).toContain('"appointments"."scheduled_at" <=');
      expect(params).toContain("clinic-test");
    });

    it("appends doctorId filter when doctorId parameter is provided", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      await listAppointmentsForDay("clinic-test", new Date(), "doc-123");

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(sql).toContain('"appointments"."doctor_id"');
      expect(params).toContain("clinic-test");
      expect(params).toContain("doc-123");
    });
  });

  describe("listAppointmentsForPatient", () => {
    it("filters by clinicId and patientId and orders descending", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await listAppointmentsForPatient("clinic-test", "pat-999");

      expect(whereSpy).toHaveBeenCalled();
      expect(result).toEqual([]);
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(sql).toContain('"appointments"."patient_id"');
      expect(params).toContain("clinic-test");
      expect(params).toContain("pat-999");
    });
  });

  describe("getAppointment", () => {
    it("queries by clinicId and appointment id, returning null when not found", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getAppointment("clinic-test", "apt-555");
      expect(result).toBeNull();

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"appointments"."clinic_id"');
      expect(sql).toContain('"appointments"."id"');
      expect(params).toContain("clinic-test");
      expect(params).toContain("apt-555");
    });
  });

  describe("listClinicDoctors", () => {
    it("filters by clinicId and role = doctor", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        then: (resolve: (val: any) => void) => resolve([]),
      };
      mockSelect.mockReturnValue(chain);

      await listClinicDoctors("clinic-test");

      expect(whereSpy).toHaveBeenCalled();
      const whereArg = whereSpy.mock.calls[0][0];
      const { sql, params } = pgDialect.sqlToQuery(whereArg);
      expect(sql).toContain('"user"."clinic_id"');
      expect(sql).toContain('"user"."role"');
      expect(params).toContain("clinic-test");
      expect(params).toContain("doctor");
    });
  });
});
