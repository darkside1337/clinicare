import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock getSession from session.ts
const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

import { requireDoctor, ForbiddenError } from "@/lib/auth/require-doctor";

describe("lib/auth/require-doctor.ts - requireDoctor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should succeed and return session context when user has role 'doctor'", async () => {
    const doctorSession = {
      user: {
        id: "doctor-1",
        name: "Dr. Gregory House",
        email: "house@clinic.dev",
      },
      clinicId: "clinic-dev",
      role: "doctor" as const,
    };
    mockGetSession.mockResolvedValueOnce(doctorSession);

    const result = await requireDoctor();

    expect(result).toEqual(doctorSession);
    expect(result.role).toBe("doctor");
  });

  it("should throw ForbiddenError when user has role 'receptionist'", async () => {
    const receptionistSession = {
      user: {
        id: "rec-1",
        name: "Pam Beesly",
        email: "pam@clinic.dev",
      },
      clinicId: "clinic-dev",
      role: "receptionist" as const,
    };
    mockGetSession.mockResolvedValue(receptionistSession);

    await expect(requireDoctor()).rejects.toThrow(ForbiddenError);
    await expect(requireDoctor()).rejects.toThrow("Forbidden: Doctor role required");
  });

  it("should reject when session resolution itself fails or redirects", async () => {
    mockGetSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT:/login"));

    await expect(requireDoctor()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("should reject when session resolution redirects to /login/not-set-up for invalid role", async () => {
    mockGetSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT:/login/not-set-up"));

    await expect(requireDoctor()).rejects.toThrow("NEXT_REDIRECT:/login/not-set-up");
  });
});
