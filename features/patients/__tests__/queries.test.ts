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
  listPatients,
  listPatientsDirectory,
  getPatient,
  getPatientSummary,
} from "../queries";

describe("features/patients/queries.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listPatients always passes clinicId and excludes soft-deleted patients in the WHERE clause, bounded to 100", async () => {
    const whereSpy = vi.fn();
    const limitSpy = vi.fn().mockResolvedValue([
      {
        id: "pat-1",
        clinicId: "clinic-test",
        name: "Alice Smith",
        deletedAt: null,
      },
    ]);
    const chain: any = {
      from: vi.fn().mockReturnThis(),
      where: whereSpy.mockImplementation(() => chain),
      orderBy: vi.fn().mockReturnThis(),
      limit: limitSpy,
    };
    mockSelect.mockReturnValue(chain);

    const result = await listPatients("clinic-test");

    expect(mockSelect).toHaveBeenCalled();
    expect(chain.from).toHaveBeenCalled();
    expect(whereSpy).toHaveBeenCalled();
    expect(limitSpy).toHaveBeenCalledWith(100);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alice Smith");

    // Inspect SQL generation from Drizzle
    const whereArg = whereSpy.mock.calls[0][0];
    const { sql, params } = pgDialect.sqlToQuery(whereArg);
    expect(sql).toContain('"patients"."clinic_id"');
    expect(sql).toContain('"patients"."deleted_at" is null');
    expect(params).toContain("clinic-test");
  });

  it("listPatients with search parameter adds ILIKE search filter with escaped wildcards", async () => {
    const whereSpy = vi.fn();
    const chain: any = {
      from: vi.fn().mockReturnThis(),
      where: whereSpy.mockImplementation(() => chain),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockSelect.mockReturnValue(chain);

    await listPatients("clinic-test", "Smith_10%\\tag");

    expect(whereSpy).toHaveBeenCalled();
    const whereArg = whereSpy.mock.calls[0][0];
    const { sql, params } = pgDialect.sqlToQuery(whereArg);
    expect(sql).toContain('"patients"."clinic_id"');
    expect(sql).toContain('"patients"."deleted_at" is null');
    expect(sql).toContain('ilike');
    expect(params).toContain("clinic-test");
    expect(params).toContain("%Smith\\_10\\%\\\\tag%");
  });

  it("getPatient returns null when patient is not found or is soft-deleted", async () => {
    const chain: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockSelect.mockReturnValue(chain);

    const result = await getPatient("clinic-test", "non-existent-id");
    expect(result).toBeNull();
  });

  it("getPatientSummary returns null for a non-existent patient", async () => {
    const chain: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockSelect.mockReturnValue(chain);

    const result = await getPatientSummary("clinic-test", "non-existent-id");
    expect(result).toBeNull();
  });

  it("getPatientSummary returns full summary when patient exists", async () => {
    const mockPatient = {
      id: "pat-123",
      clinicId: "clinic-test",
      name: "John Doe",
      dob: "1980-01-01",
      sex: "Male",
      deletedAt: null,
    };

    let callCount = 0;
    mockSelect.mockImplementation(() => {
      callCount++;
      const currentCall = callCount;
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: (resolve: (val: any) => void) => {
          if (currentCall === 1) return resolve([mockPatient]);
          if (currentCall === 2) return resolve([{ id: "alg-1", substance: "Penicillin" }]);
          if (currentCall === 3) return resolve([{ id: "prb-1", condition: "Hypertension" }]);
          if (currentCall === 4) return resolve([]);
          if (currentCall === 5) return resolve([]);
          return resolve([]);
        },
      };
      return chain;
    });

    const summary = await getPatientSummary("clinic-test", "pat-123");
    expect(summary).not.toBeNull();
    expect(summary?.patient.name).toBe("John Doe");
    expect(summary?.allergies).toHaveLength(1);
    expect(summary?.problems).toHaveLength(1);
  });

  describe("listPatientsDirectory", () => {
    it("returns patients without querying allergies or problems for receptionist role", async () => {
      const mockPatient = {
        id: "pat-1",
        clinicId: "clinic-test",
        name: "Alice Smith",
        dob: "1990-01-01",
        deletedAt: null,
      };

      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockPatient]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await listPatientsDirectory("clinic-test", "receptionist");

      // mockSelect should be called only once for listPatients, never for allergies or problems
      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].hasSevereAllergy).toBe(false);
      expect(result[0].allergySummary).toBeUndefined();
      expect(result[0].activeConditions).toEqual([]);
    });

    it("enriches allergy and problem data for doctor role", async () => {
      const mockPatient = {
        id: "pat-1",
        clinicId: "clinic-test",
        name: "Alice Smith",
        dob: "1990-01-01",
        deletedAt: null,
      };

      let callCount = 0;
      mockSelect.mockImplementation(() => {
        callCount++;
        const currentCall = callCount;
        const chain: any = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          then: (resolve: (val: any) => void) => {
            if (currentCall === 1) return resolve([mockPatient]);
            if (currentCall === 2)
              return resolve([
                {
                  patientId: "pat-1",
                  substance: "Peanuts",
                  severity: "severe",
                  reaction: "Anaphylaxis",
                },
              ]);
            if (currentCall === 3)
              return resolve([
                {
                  patientId: "pat-1",
                  condition: "Asthma",
                },
              ]);
            return resolve([]);
          },
        };
        return chain;
      });

      const result = await listPatientsDirectory("clinic-test", "doctor");

      expect(mockSelect).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(1);
      expect(result[0].hasSevereAllergy).toBe(true);
      expect(result[0].allergySummary).toBe("Peanuts (Anaphylaxis)");
      expect(result[0].activeConditions).toEqual(["Asthma"]);
    });
  });
});
