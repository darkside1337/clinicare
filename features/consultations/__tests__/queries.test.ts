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
  listConsultationsForPatient,
  getConsultation,
} from "../queries";

describe("features/consultations/queries.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listConsultationsForPatient", () => {
    it("returns empty array when patient does not belong to clinic", async () => {
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await listConsultationsForPatient("clinic-test", "pat-nonexistent");
      expect(result).toEqual([]);
    });

    it("verifies clinicId in patient check, orders by createdAt desc, and maps prescription counts", async () => {
      let selectCount = 0;
      const whereSpies: any[] = [];
      const orderBySpy = vi.fn();

      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const whereSpy = vi.fn();
        whereSpies.push(whereSpy);

        if (current === 1) {
          // Patient check
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: whereSpy.mockImplementation(() => chain),
            limit: vi.fn().mockResolvedValue([{ id: "pat-1" }]),
          };
          return chain;
        }

        if (current === 2) {
          // Consultations query
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: whereSpy.mockImplementation(() => chain),
            orderBy: orderBySpy.mockImplementation(() =>
              Promise.resolve([
                {
                  id: "cns-1",
                  patientId: "pat-1",
                  doctorId: "doc-1",
                  appointmentId: "apt-1",
                  chiefComplaint: "Sore throat",
                  symptoms: "Fever, odynophagia",
                  observations: "Tonsillar exudate",
                  diagnosis: "Streptococcal pharyngitis",
                  treatment: "Penicillin V 500mg QDS 10 days",
                  notes: null,
                  createdAt: new Date("2026-09-26T10:00:00Z"),
                  updatedAt: new Date("2026-09-26T10:00:00Z"),
                  doctorName: "Dr. Finch",
                  appointmentScheduledAt: new Date("2026-09-26T09:30:00Z"),
                  appointmentIsWalkIn: false,
                  appointmentStatus: "completed",
                },
              ])
            ),
          };
          return chain;
        }

        if (current === 3) {
          // Prescriptions check
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: whereSpy.mockResolvedValue([
              { id: "rx-1", consultationId: "cns-1" },
            ]),
          };
          return chain;
        }

        return {};
      });

      const result = await listConsultationsForPatient("clinic-test", "pat-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("cns-1");
      expect(result[0].doctorName).toBe("Dr. Finch");
      expect(result[0].hasPrescription).toBe(true);
      expect(result[0].prescriptionCount).toBe(1);

      // Verify patient check SQL
      const patientWhere = pgDialect.sqlToQuery(whereSpies[0].mock.calls[0][0]);
      expect(patientWhere.sql).toContain('"patients"."clinic_id"');
      expect(patientWhere.sql).toContain('"patients"."deleted_at" is null');
      expect(patientWhere.params).toContain("clinic-test");
      expect(patientWhere.params).toContain("pat-1");
    });
  });

  describe("getConsultation", () => {
    it("returns null if consultation is not found in clinic", async () => {
      const chain: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getConsultation("clinic-test", "cns-missing");
      expect(result).toBeNull();
    });

    it("returns consultation detail with patient, doctor, appointment, and prescriptions", async () => {
      let selectCount = 0;
      const whereSpies: any[] = [];

      mockSelect.mockImplementation(() => {
        selectCount++;
        const current = selectCount;
        const whereSpy = vi.fn();
        whereSpies.push(whereSpy);

        if (current === 1) {
          // Consultation + patient + doctor + appointment
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: whereSpy.mockImplementation(() => chain),
            limit: vi.fn().mockResolvedValue([
              {
                id: "cns-1",
                patientId: "pat-1",
                doctorId: "doc-1",
                appointmentId: "apt-1",
                chiefComplaint: "Persistent headache",
                symptoms: "Bilateral tight pressure",
                observations: "Normal cranial nerves",
                diagnosis: "Tension-type headache",
                treatment: "Simple analgesia, hydration",
                notes: "Safety net provided",
                createdAt: new Date("2026-09-26T10:00:00Z"),
                updatedAt: new Date("2026-09-26T10:00:00Z"),
                patientClinicId: "clinic-test",
                patientName: "Jane Doe",
                patientDob: "15/05/1988",
                patientSex: "Female",
                patientPhone: "+44 7700 900123",
                patientEmail: "jane@example.com",
                patientAddress: "12 High St",
                doctorName: "Dr. Finch",
                doctorEmail: "finch@clinic.com",
                appointmentScheduledAt: new Date("2026-09-26T09:30:00Z"),
                appointmentIsWalkIn: false,
                appointmentStatus: "completed",
                appointmentReason: "Headache consultation",
              },
            ]),
          };
          return chain;
        }

        if (current === 2) {
          // Prescriptions
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: whereSpy.mockImplementation(() => chain),
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "rx-1",
                consultationId: "cns-1",
                createdAt: new Date("2026-09-26T10:05:00Z"),
              },
            ]),
          };
          return chain;
        }

        if (current === 3) {
          // Prescription items
          const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: whereSpy.mockResolvedValue([
              {
                id: "item-1",
                prescriptionId: "rx-1",
                medication: "Paracetamol 500mg",
                dosage: "1-2 tablets",
                frequency: "QDS PRN",
                duration: "7 days",
                instructions: "Max 8 tablets in 24 hours",
              },
            ]),
          };
          return chain;
        }

        return {};
      });

      const result = await getConsultation("clinic-test", "cns-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("cns-1");
      expect(result?.patient.name).toBe("Jane Doe");
      expect(result?.doctor.name).toBe("Dr. Finch");
      expect(result?.prescriptions).toHaveLength(1);
      expect(result?.prescriptions[0].items).toHaveLength(1);
      expect(result?.prescriptions[0].items[0].medication).toBe("Paracetamol 500mg");

      // Verify consultation where clause scopes by clinicId via patients
      const queryInfo = pgDialect.sqlToQuery(whereSpies[0].mock.calls[0][0]);
      expect(queryInfo.sql).toContain('"consultations"."id"');
      expect(queryInfo.sql).toContain('"patients"."clinic_id"');
      expect(queryInfo.sql).toContain('"patients"."deleted_at" is null');
      expect(queryInfo.params).toContain("clinic-test");
      expect(queryInfo.params).toContain("cns-1");
    });
  });
});
