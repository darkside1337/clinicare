import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks
const mockGetSession = vi.fn();
const mockRequireDoctor = vi.fn();
const mockListPatients = vi.fn();
const mockCreateWalkInAppointment = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

vi.mock("@/lib/auth/require-doctor", () => ({
  requireDoctor: () => mockRequireDoctor(),
}));

vi.mock("@/features/patients/queries", () => ({
  listPatients: (...args: unknown[]) => mockListPatients(...args),
}));

vi.mock("@/features/appointments/mutations", () => ({
  createWalkInAppointment: (...args: unknown[]) => mockCreateWalkInAppointment(...args),
}));

import {
  searchPatientsAction,
  startWalkInConsultationAction,
} from "../actions";

describe("App Shell Server Actions (app/(app)/actions.ts)", () => {
  const fakeSession = {
    user: { id: "doc-1", name: "Dr. Gregory House", email: "house@clinic.local" },
    clinicId: "clinic-test-1",
    role: "doctor" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchPatientsAction", () => {
    it("returns empty array when query is empty or whitespace", async () => {
      mockGetSession.mockResolvedValueOnce(fakeSession);

      const resEmpty = await searchPatientsAction("");
      expect(resEmpty).toEqual([]);
      expect(mockListPatients).not.toHaveBeenCalled();

      const resWhitespace = await searchPatientsAction("   ");
      expect(resWhitespace).toEqual([]);
      expect(mockListPatients).not.toHaveBeenCalled();
    });

    it("scopes search strictly to authenticated clinicId and returns formatted results", async () => {
      mockGetSession.mockResolvedValueOnce(fakeSession);
      mockListPatients.mockResolvedValueOnce([
        {
          id: "pat-1",
          clinicId: "clinic-test-1",
          name: "John Doe",
          dob: "1980-05-12",
          sex: "male",
          phone: "+44 7700 900123",
          email: "john@example.com",
          createdAt: new Date(),
        },
      ]);

      const results = await searchPatientsAction("John");

      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(mockListPatients).toHaveBeenCalledWith("clinic-test-1", "John");
      expect(results).toEqual([
        {
          id: "pat-1",
          name: "John Doe",
          dob: "1980-05-12",
          sex: "male",
          phone: "+44 7700 900123",
          email: "john@example.com",
        },
      ]);
    });
  });

  describe("startWalkInConsultationAction", () => {
    it("calls requireDoctor and creates walk-in appointment for doctors", async () => {
      mockRequireDoctor.mockResolvedValueOnce(fakeSession);
      mockCreateWalkInAppointment.mockResolvedValueOnce({
        id: "apt-walkin-99",
        clinicId: "clinic-test-1",
        patientId: "pat-1",
        doctorId: "doc-1",
        scheduledAt: new Date(),
        status: "checked-in",
        isWalkIn: true,
      });

      const res = await startWalkInConsultationAction("pat-1");

      expect(mockRequireDoctor).toHaveBeenCalledTimes(1);
      expect(mockCreateWalkInAppointment).toHaveBeenCalledWith(
        "clinic-test-1",
        "pat-1",
        "doc-1",
        expect.stringContaining("Walk-in consultation")
      );
      expect(res).toEqual({
        success: true,
        data: {
          appointmentId: "apt-walkin-99",
          redirectUrl: "/patients/pat-1/consultations/new?appointmentId=apt-walkin-99",
        },
      });
    });

    it("returns error result when requireDoctor throws ForbiddenError", async () => {
      mockRequireDoctor.mockRejectedValueOnce(
        new Error("Forbidden: Doctor role required.")
      );

      const res = await startWalkInConsultationAction("pat-1");

      expect(mockRequireDoctor).toHaveBeenCalledTimes(1);
      expect(mockCreateWalkInAppointment).not.toHaveBeenCalled();
      expect(res).toEqual({
        success: false,
        error: "Forbidden: Doctor role required.",
      });
    });

    it("returns error result when patientId is missing", async () => {
      mockRequireDoctor.mockResolvedValueOnce(fakeSession);

      const res = await startWalkInConsultationAction("");

      expect(res).toEqual({
        success: false,
        error: "Patient ID is required.",
      });
      expect(mockCreateWalkInAppointment).not.toHaveBeenCalled();
    });
  });
});
