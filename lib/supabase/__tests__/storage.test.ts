import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockCreateSignedUrl = vi.fn();

const mockFrom = vi.fn(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
  createSignedUrl: mockCreateSignedUrl,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: mockFrom,
    },
  })),
}));

import {
  uploadClinicLogo,
  uploadDoctorSignature,
  getPublicUrl,
  _resetStorageClient,
} from "../storage";

describe("lib/supabase/storage.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetStorageClient();
  });

  describe("uploadClinicLogo", () => {
    it("uploads to clinics/{clinicId}/logo and returns public URL", async () => {
      mockUpload.mockResolvedValue({ data: { path: "clinic-123/logo" }, error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/clinics/clinic-123/logo" },
      });

      const fakeFile = new File(["dummy-logo-bytes"], "logo.png", { type: "image/png" });
      const result = await uploadClinicLogo("clinic-123", fakeFile);

      expect(mockFrom).toHaveBeenCalledWith("clinics");
      expect(mockUpload).toHaveBeenCalledWith("clinic-123/logo", fakeFile, {
        upsert: true,
        contentType: "image/png",
      });
      expect(mockGetPublicUrl).toHaveBeenCalledWith("clinic-123/logo");
      expect(result).toBe("https://example.supabase.co/storage/v1/object/public/clinics/clinic-123/logo");
    });

    it("throws an error if clinicId is missing", async () => {
      const fakeFile = new File(["dummy"], "logo.png", { type: "image/png" });
      await expect(uploadClinicLogo("", fakeFile)).rejects.toThrow("clinicId is required");
    });

    it("throws an error if Supabase upload fails", async () => {
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: "Storage quota exceeded" },
      });

      const fakeFile = new File(["dummy"], "logo.png", { type: "image/png" });
      await expect(uploadClinicLogo("clinic-123", fakeFile)).rejects.toThrow(
        "Failed to upload clinic logo: Storage quota exceeded"
      );
    });
  });

  describe("uploadDoctorSignature", () => {
    it("uploads to doctors/{doctorId}/signature and returns signed URL", async () => {
      mockUpload.mockResolvedValue({ data: { path: "doc-456/signature" }, error: null });
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: "https://example.supabase.co/storage/v1/object/sign/doctors/doc-456/signature?token=xyz" },
        error: null,
      });

      const fakeFile = new File(["dummy-sig-bytes"], "sig.png", { type: "image/png" });
      const result = await uploadDoctorSignature("doc-456", fakeFile);

      expect(mockFrom).toHaveBeenCalledWith("doctors");
      expect(mockUpload).toHaveBeenCalledWith("doc-456/signature", fakeFile, {
        upsert: true,
        contentType: "image/png",
      });
      expect(mockCreateSignedUrl).toHaveBeenCalledWith("doc-456/signature", 3600);
      expect(result).toBe(
        "https://example.supabase.co/storage/v1/object/sign/doctors/doc-456/signature?token=xyz"
      );
    });

    it("throws an error if doctorId is missing", async () => {
      const fakeFile = new File(["dummy"], "sig.png", { type: "image/png" });
      await expect(uploadDoctorSignature("", fakeFile)).rejects.toThrow("doctorId is required");
    });

    it("throws an error if signing fails", async () => {
      mockUpload.mockResolvedValue({ data: { path: "doc-456/signature" }, error: null });
      mockCreateSignedUrl.mockResolvedValue({
        data: null,
        error: { message: "Signature token generation failed" },
      });

      const fakeFile = new File(["dummy"], "sig.png", { type: "image/png" });
      await expect(uploadDoctorSignature("doc-456", fakeFile)).rejects.toThrow(
        "Failed to create signed URL for signature: Signature token generation failed"
      );
    });
  });

  describe("getPublicUrl", () => {
    it("returns publicUrl from storage", () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/clinics/sample/logo" },
      });

      const url = getPublicUrl("sample/logo", "clinics");
      expect(mockFrom).toHaveBeenCalledWith("clinics");
      expect(mockGetPublicUrl).toHaveBeenCalledWith("sample/logo");
      expect(url).toBe("https://example.supabase.co/storage/v1/object/public/clinics/sample/logo");
    });
  });
});
