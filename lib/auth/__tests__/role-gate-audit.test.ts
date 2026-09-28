import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenError } from "@/lib/auth/require-doctor";

// Mock ONLY session.ts — requireDoctor runs its REAL implementation
const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

// Mock next/cache revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock feature mutations to isolate auth/role enforcement
vi.mock("@/features/patients/mutations", () => ({
  createAllergy: vi.fn().mockResolvedValue({ id: "all-1" }),
  updateAllergy: vi.fn().mockResolvedValue({ id: "all-1" }),
  deleteAllergy: vi.fn().mockResolvedValue({ id: "all-1" }),
  createProblem: vi.fn().mockResolvedValue({ id: "prob-1" }),
  updateProblem: vi.fn().mockResolvedValue({ id: "prob-1" }),
  updatePatient: vi.fn().mockResolvedValue({ id: "pat-1", name: "Updated Name" }),
}));

vi.mock("@/features/consultations/mutations", () => ({
  createConsultation: vi.fn().mockResolvedValue({ id: "cons-1" }),
  updateConsultation: vi.fn().mockResolvedValue({ id: "cons-1" }),
}));

vi.mock("@/features/prescriptions/mutations", () => ({
  createPrescription: vi.fn().mockResolvedValue({ id: "rx-1", items: [] }),
}));

vi.mock("@/features/appointments/mutations", () => ({
  createWalkInAppointment: vi.fn().mockResolvedValue({ id: "apt-walkin-1" }),
}));

import {
  addAllergyAction,
  deleteAllergyAction,
  addProblemAction,
  updateProblemAction,
  updatePatientAction,
} from "@/app/(app)/patients/[id]/actions";
import { createConsultationAction } from "@/app/(app)/patients/[id]/consultations/new/actions";
import {
  updateConsultationAction,
  createPrescriptionAction,
} from "@/app/(app)/patients/[id]/consultations/[consultationId]/actions";
import { startWalkInConsultationAction } from "@/app/(app)/actions";

describe("Role-Gate Audit: Server Action Role Enforcement", () => {
  const receptionistSession = {
    user: { id: "rec-1", name: "Riley Receptionist", email: "reception@clinic.dev" },
    clinicId: "clinic-test",
    role: "receptionist" as const,
  };

  const doctorSession = {
    user: { id: "doc-1", name: "Dr. Gregory House", email: "house@clinic.dev" },
    clinicId: "clinic-test",
    role: "doctor" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Receptionist Role Rejection on Clinical Mutations", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue(receptionistSession);
    });

    it("addAllergyAction rejects receptionists with Forbidden error", async () => {
      await expect(
        addAllergyAction("pat-1", {
          substance: "Penicillin",
          severity: "severe",
          reaction: "Anaphylaxis",
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("deleteAllergyAction rejects receptionists with Forbidden error", async () => {
      await expect(
        deleteAllergyAction("all-1", "pat-1")
      ).rejects.toThrow(ForbiddenError);
    });

    it("addProblemAction rejects receptionists with Forbidden error", async () => {
      await expect(
        addProblemAction("pat-1", {
          condition: "Hypertension",
          status: "active",
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("updateProblemAction rejects receptionists with Forbidden error", async () => {
      await expect(
        updateProblemAction("prob-1", "pat-1", {
          status: "resolved",
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("createConsultationAction rejects receptionists with Forbidden error", async () => {
      await expect(
        createConsultationAction("pat-1", {
          patientId: "pat-1",
          chiefComplaint: "Severe migraine",
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("updateConsultationAction rejects receptionists with Forbidden error", async () => {
      await expect(
        updateConsultationAction("pat-1", "cons-1", {
          notes: "Follow up in 2 weeks",
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("createPrescriptionAction rejects receptionists with Forbidden error", async () => {
      await expect(
        createPrescriptionAction("pat-1", {
          consultationId: "cons-1",
          items: [
            {
              medication: "Amoxicillin",
              dosage: "500mg",
              frequency: "TDS",
              duration: "7 days",
            },
          ],
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("startWalkInConsultationAction rejects receptionists with Forbidden error", async () => {
      await expect(
        startWalkInConsultationAction("pat-1")
      ).rejects.toThrow(ForbiddenError);
    });

    it("updatePatientAction allows receptionists to update administrative demographics", async () => {
      const res = await updatePatientAction("pat-1", {
        name: "Jane Updated",
        phone: "07123456789",
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBeDefined();
      }
    });
  });

  describe("Doctor Role Authorization", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue(doctorSession);
    });

    it("addAllergyAction succeeds for doctors", async () => {
      const res = await addAllergyAction("pat-1", {
        substance: "Latex",
        severity: "moderate",
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBeDefined();
      }
    });

    it("createConsultationAction succeeds for doctors", async () => {
      const res = await createConsultationAction("pat-1", {
        patientId: "pat-1",
        chiefComplaint: "Chest pain",
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBeDefined();
      }
    });
  });
});
