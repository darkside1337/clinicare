import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { ForbiddenError } from "@/lib/auth/require-doctor";

// Mock requireDoctor
const mockRequireDoctor = vi.fn();
vi.mock("@/lib/auth/require-doctor", () => ({
  requireDoctor: () => mockRequireDoctor(),
  ForbiddenError: class ForbiddenError extends Error {
    constructor(message = "Forbidden: Doctor role required") {
      super(message);
      this.name = "ForbiddenError";
    }
  },
}));

// Mock queries
const mockGetPrescription = vi.fn();
vi.mock("@/features/prescriptions/queries", () => ({
  getPrescription: (...args: unknown[]) => mockGetPrescription(...args),
}));

// Mock PDF generator
const mockGeneratePdf = vi.fn();
vi.mock("@/features/prescriptions/pdf/generate-prescription-pdf", () => ({
  generatePrescriptionPdfResponse: (...args: unknown[]) => mockGeneratePdf(...args),
}));

import { GET } from "../pdf/route";

describe("Prescription PDF Route - Tenant & Role Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when caller is a receptionist", async () => {
    mockRequireDoctor.mockRejectedValueOnce(
      new ForbiddenError("Forbidden: Doctor role required")
    );

    const req = new NextRequest("http://localhost:3000/prescriptions/rx-1/pdf");
    const response = await GET(req, {
      params: Promise.resolve({ id: "rx-1" }),
    });

    expect(response.status).toBe(403);
    const body = await response.text();
    expect(body).toContain("Forbidden: Doctor role required");
    expect(mockGetPrescription).not.toHaveBeenCalled();
    expect(mockGeneratePdf).not.toHaveBeenCalled();
  });

  it("returns 404 for a foreign prescription in clinic-b with a clinic-a session", async () => {
    mockRequireDoctor.mockResolvedValueOnce({
      user: { id: "doc-1", name: "Dr. A", email: "a@clinic.dev" },
      clinicId: "clinic-a",
      role: "doctor",
    });

    // getPrescription returns null because rx-in-b does not belong to clinic-a
    mockGetPrescription.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/prescriptions/rx-in-b/pdf");
    const response = await GET(req, {
      params: Promise.resolve({ id: "rx-in-b" }),
    });

    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).toBe("Prescription not found");

    // Strictly verifies getPrescription was passed session.clinicId ("clinic-a")
    expect(mockGetPrescription).toHaveBeenCalledWith("clinic-a", "rx-in-b");
    expect(mockGeneratePdf).not.toHaveBeenCalled();
  });

  it("returns 200 and generates PDF when doctor accesses a prescription within their own clinic", async () => {
    const mockRx = {
      id: "rx-in-a",
      patient: { name: "Patient A" },
      items: [],
    };
    mockRequireDoctor.mockResolvedValueOnce({
      user: { id: "doc-1", name: "Dr. A", email: "a@clinic.dev" },
      clinicId: "clinic-a",
      role: "doctor",
    });
    mockGetPrescription.mockResolvedValueOnce(mockRx);
    mockGeneratePdf.mockResolvedValueOnce(
      new Response("fake-pdf-stream", {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      })
    );

    const req = new NextRequest("http://localhost:3000/prescriptions/rx-in-a/pdf");
    const response = await GET(req, {
      params: Promise.resolve({ id: "rx-in-a" }),
    });

    expect(response.status).toBe(200);
    expect(mockGetPrescription).toHaveBeenCalledWith("clinic-a", "rx-in-a");
    expect(mockGeneratePdf).toHaveBeenCalledWith(mockRx);
  });
});
