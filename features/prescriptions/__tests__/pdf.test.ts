import { describe, it, expect } from "vitest";
import {
  sanitizeUnicodeFilename,
  formatContentDisposition,
} from "../pdf/generate-prescription-pdf";

describe("features/prescriptions/pdf/generate-prescription-pdf.ts", () => {
  describe("sanitizeUnicodeFilename", () => {
    it("returns 'patient' when given empty or whitespace string", () => {
      expect(sanitizeUnicodeFilename("")).toBe("patient");
      expect(sanitizeUnicodeFilename("   ")).toBe("patient");
    });

    it("preserves standard Latin and hyphenated names", () => {
      expect(sanitizeUnicodeFilename("John Doe")).toBe("John_Doe");
      expect(sanitizeUnicodeFilename("Sarah Jane-Smith")).toBe("Sarah_Jane-Smith");
    });

    it("preserves European accented characters and apostrophes", () => {
      expect(sanitizeUnicodeFilename("Éléonore Müller")).toBe("Éléonore_Müller");
      expect(sanitizeUnicodeFilename("Søren Kierkegaard")).toBe("Søren_Kierkegaard");
      expect(sanitizeUnicodeFilename("Łukasz Nowak")).toBe("Łukasz_Nowak");
      expect(sanitizeUnicodeFilename("Sean O'Connor")).toBe("Sean_O'Connor");
    });

    it("preserves international Unicode characters such as Arabic", () => {
      expect(sanitizeUnicodeFilename("محمد بن علي")).toBe("محمد_بن_علي");
    });

    it("strips illegal filesystem and control characters", () => {
      const malicious = 'bad/path\\name:with*illegal?"chars<>|and\x00null';
      const sanitized = sanitizeUnicodeFilename(malicious);
      expect(sanitized).not.toMatch(/[<>:"/\\|?*\x00-\x1F]/);
    });

    it("caps string length to specified maxLength", () => {
      const longName = "A".repeat(120);
      const sanitized = sanitizeUnicodeFilename(longName, 50);
      expect(sanitized.length).toBe(50);
    });
  });

  describe("formatContentDisposition", () => {
    it("formats standard ASCII filename with dual parameters", () => {
      const header = formatContentDisposition("RX-ABC12345", "Jane Smith", "inline");

      expect(header).toContain('inline; filename="Prescription-RX-ABC12345-Jane_Smith.pdf"');
      expect(header).toContain(
        "filename*=UTF-8''Prescription-RX-ABC12345-Jane_Smith.pdf"
      );
    });

    it("provides ASCII fallback and encoded UTF-8 for European names with accents", () => {
      const header = formatContentDisposition("RX-12345678", "Éléonore Müller");

      // Verify the ASCII fallback only contains safe ASCII word/hyphen/underscore characters
      const asciiMatch = header.match(/filename="([^"]+)"/);
      expect(asciiMatch).toBeTruthy();
      const asciiFilename = asciiMatch![1];
      // Must not contain non-ASCII bytes
      expect(/^[\x20-\x7E]+$/.test(asciiFilename)).toBe(true);

      // Verify the UTF-8 parameter is percent-encoded
      expect(header).toContain(
        `filename*=UTF-8''${encodeURIComponent("Prescription-RX-12345678-Éléonore_Müller.pdf")}`
      );
    });

    it("provides ASCII fallback and encoded UTF-8 for Arabic/international names", () => {
      const header = formatContentDisposition("RX-88889999", "محمد بن علي");

      const asciiMatch = header.match(/filename="([^"]+)"/);
      expect(asciiMatch).toBeTruthy();
      expect(/^[\x20-\x7E]+$/.test(asciiMatch![1])).toBe(true);

      expect(header).toContain(
        `filename*=UTF-8''${encodeURIComponent("Prescription-RX-88889999-محمد_بن_علي.pdf")}`
      );
    });

    it("supports attachment disposition", () => {
      const header = formatContentDisposition("RX-0001", "John", "attachment");
      expect(header.startsWith("attachment;")).toBe(true);
    });
  });
});
