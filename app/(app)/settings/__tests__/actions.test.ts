import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock requireDoctor
const mockRequireDoctor = vi.fn();
vi.mock("@/lib/auth/require-doctor", () => ({
  requireDoctor: () => mockRequireDoctor(),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock storage
const mockUploadClinicLogo = vi.fn();
vi.mock("@/lib/supabase/storage", () => ({
  uploadClinicLogo: (...args: unknown[]) => mockUploadClinicLogo(...args),
}));

// Mock clinic mutations
const mockUpdateClinicLogo = vi.fn();
vi.mock("@/features/clinics/mutations", () => ({
  updateClinicLogo: (...args: unknown[]) => mockUpdateClinicLogo(...args),
}));

import { uploadClinicLogoAction } from "../actions";

describe("app/(app)/settings/actions.ts - uploadClinicLogoAction", () => {
  const doctorSession = {
    user: { id: "doc-1", name: "Dr. Smith", email: "smith@clinic.dev" },
    clinicId: "clinic-test",
    role: "doctor" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDoctor.mockResolvedValue(doctorSession);
  });

  it("rejects image/svg+xml uploads without invoking storage upload", async () => {
    const formData = new FormData();
    const svgFile = new File(["<svg></svg>"], "logo.svg", {
      type: "image/svg+xml",
    });
    formData.append("logo", svgFile);

    const result = await uploadClinicLogoAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/invalid file type/i);
      expect(result.error).not.toContain("SVG");
    }
    expect(mockUploadClinicLogo).not.toHaveBeenCalled();
    expect(mockUpdateClinicLogo).not.toHaveBeenCalled();
  });

  it("rejects file when extension does not match MIME type", async () => {
    const formData = new FormData();
    // Claiming to be png but extension is .svg
    const spoofedFile = new File(["fake png data"], "malicious.svg", {
      type: "image/png",
    });
    formData.append("logo", spoofedFile);

    const result = await uploadClinicLogoAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/extension does not match/i);
    }
    expect(mockUploadClinicLogo).not.toHaveBeenCalled();
  });

  it("rejects file exceeding 2MB limit", async () => {
    const formData = new FormData();
    const largeContent = new Uint8Array(2 * 1024 * 1024 + 1);
    const largeFile = new File([largeContent], "large.png", {
      type: "image/png",
    });
    formData.append("logo", largeFile);

    const result = await uploadClinicLogoAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/exceeds 2MB/i);
    }
    expect(mockUploadClinicLogo).not.toHaveBeenCalled();
  });

  it("successfully uploads valid PNG logo and updates clinic record", async () => {
    mockUploadClinicLogo.mockResolvedValueOnce(
      "https://example.com/storage/clinic-test/logo.png"
    );
    mockUpdateClinicLogo.mockResolvedValueOnce({
      id: "clinic-test",
      logoUrl: "https://example.com/storage/clinic-test/logo.png",
    });

    const formData = new FormData();
    const validFile = new File(["pngcontent"], "logo.png", {
      type: "image/png",
    });
    formData.append("logo", validFile);

    const result = await uploadClinicLogoAction(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.logoUrl).toBe(
        "https://example.com/storage/clinic-test/logo.png"
      );
    }
    expect(mockUploadClinicLogo).toHaveBeenCalledWith(
      "clinic-test",
      validFile,
      { contentType: "image/png" }
    );
    expect(mockUpdateClinicLogo).toHaveBeenCalledWith(
      "clinic-test",
      "https://example.com/storage/clinic-test/logo.png"
    );
  });
});
