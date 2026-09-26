import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockTxInsert = vi.fn();

const mockTransaction = vi.fn().mockImplementation(async (callback) => {
  return await callback({
    insert: (...args: unknown[]) => mockTxInsert(...args),
  });
});

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    select: (...args: unknown[]) => mockSelect(...args),
    transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

import { createPrescription } from "../mutations";

describe("features/prescriptions/mutations.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPrescription", () => {
    it("enforces tenant boundary and throws when consultation is not found in clinic", async () => {
      const whereSpy = vi.fn();
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: whereSpy.mockImplementation(() => chain),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      await expect(
        createPrescription("clinic-target", {
          consultationId: "cns-other",
          items: [
            {
              medication: "Paracetamol",
              dosage: "500mg",
              frequency: "QDS",
              duration: "3 days",
            },
          ],
        })
      ).rejects.toThrow("Consultation cns-other not found in clinic or not authorized.");

      expect(whereSpy).toHaveBeenCalledTimes(1);
      const whereClause = whereSpy.mock.calls[0][0];
      const sql = pgDialect.sqlToQuery(whereClause.getSQL()).sql;
      expect(sql).toContain('"patients"."clinic_id" = $2');
      expect(sql).toContain('"patients"."deleted_at" is null');
    });

    it("inserts prescription and all items atomically in a single transaction", async () => {
      // 1. Mock consultation verification
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: "cns-valid" }]),
      };
      mockSelect.mockReturnValue(chain);

      // 2. Mock transaction inserts
      let insertCount = 0;
      const valuesSpies: any[] = [];

      mockTxInsert.mockImplementation(() => {
        insertCount++;
        const current = insertCount;
        const valuesSpy = vi.fn();
        valuesSpies.push(valuesSpy);

        const txChain: any = {
          values: valuesSpy.mockImplementation(() => txChain),
          returning: vi.fn().mockImplementation(() => {
            if (current === 1) {
              return Promise.resolve([
                {
                  id: "rx-generated-123",
                  consultationId: "cns-valid",
                  createdAt: new Date("2026-09-26T12:00:00Z"),
                },
              ]);
            }
            if (current === 2) {
              return Promise.resolve([
                {
                  id: "item-1",
                  prescriptionId: "rx-generated-123",
                  medication: "Amoxicillin 500mg",
                  dosage: "500mg",
                  frequency: "TDS",
                  duration: "7 days",
                  instructions: "Take with meals",
                },
                {
                  id: "item-2",
                  prescriptionId: "rx-generated-123",
                  medication: "Paracetamol 500mg",
                  dosage: "1g",
                  frequency: "QDS",
                  duration: "3 days",
                  instructions: null,
                },
              ]);
            }
            return Promise.resolve([]);
          }),
        };
        return txChain;
      });

      const result = await createPrescription("clinic-1", {
        consultationId: "cns-valid",
        items: [
          {
            medication: "Amoxicillin 500mg",
            dosage: "500mg",
            frequency: "TDS",
            duration: "7 days",
            instructions: "Take with meals",
          },
          {
            medication: "Paracetamol 500mg",
            dosage: "1g",
            frequency: "QDS",
            duration: "3 days",
            instructions: null,
          },
        ],
      });

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockTxInsert).toHaveBeenCalledTimes(2);

      // Verify prescription insert values
      expect(valuesSpies[0]).toHaveBeenCalledWith({
        consultationId: "cns-valid",
      });

      // Verify line items insert values received prescriptionId
      expect(valuesSpies[1]).toHaveBeenCalledWith([
        {
          prescriptionId: "rx-generated-123",
          medication: "Amoxicillin 500mg",
          dosage: "500mg",
          frequency: "TDS",
          duration: "7 days",
          instructions: "Take with meals",
        },
        {
          prescriptionId: "rx-generated-123",
          medication: "Paracetamol 500mg",
          dosage: "1g",
          frequency: "QDS",
          duration: "3 days",
          instructions: null,
        },
      ]);

      expect(result.id).toBe("rx-generated-123");
      expect(result.items).toHaveLength(2);
      expect(result.items[0].prescriptionId).toBe("rx-generated-123");
    });

    it("creates independent prescription rows on multiple calls without overwriting", async () => {
      // Mock consultation verification
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: "cns-repeat" }]),
      };
      mockSelect.mockReturnValue(chain);

      let callIndex = 0;
      mockTxInsert.mockImplementation(() => {
        callIndex++;
        const current = callIndex;
        const rxId = current <= 2 ? "rx-first" : "rx-second";

        const txChain: any = {
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockImplementation(() => {
            if (current % 2 === 1) {
              return Promise.resolve([
                {
                  id: rxId,
                  consultationId: "cns-repeat",
                  createdAt: new Date(),
                },
              ]);
            } else {
              return Promise.resolve([
                {
                  id: `item-${current}`,
                  prescriptionId: rxId,
                  medication: "Test Med",
                  dosage: "1 tab",
                  frequency: "Daily",
                  duration: "5 days",
                  instructions: null,
                },
              ]);
            }
          }),
        };
        return txChain;
      });

      const firstRx = await createPrescription("clinic-1", {
        consultationId: "cns-repeat",
        items: [
          {
            medication: "First Med",
            dosage: "1 tab",
            frequency: "Daily",
            duration: "5 days",
          },
        ],
      });

      const secondRx = await createPrescription("clinic-1", {
        consultationId: "cns-repeat",
        items: [
          {
            medication: "Second Med",
            dosage: "2 tabs",
            frequency: "BD",
            duration: "7 days",
          },
        ],
      });

      expect(mockTransaction).toHaveBeenCalledTimes(2);
      expect(firstRx.id).toBe("rx-first");
      expect(secondRx.id).toBe("rx-second");
      expect(firstRx.id).not.toBe(secondRx.id);
    });
  });
});
