import React from "react";
import { Readable } from "node:stream";
import { renderToStream } from "@react-pdf/renderer";
import type { PrescriptionDetail } from "@/features/prescriptions/queries";
import PrescriptionPdfDocument from "@/features/prescriptions/pdf/prescription-document";

/**
 * Sanitizes a patient name for use in filenames while preserving European accents
 * (e.g. Müller, Éléonore, Sørensen, Łukasz, O'Connor) and international Unicode names.
 * Strips filesystem-illegal characters and control characters, replacing whitespace with underscores.
 */
export function sanitizeUnicodeFilename(value: string, maxLength = 60): string {
  if (!value) return "patient";

  const sanitized = value
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, maxLength);

  return sanitized || "patient";
}

/**
 * Formats an RFC 5987 / RFC 6266 compliant Content-Disposition header.
 * Emits an ASCII-safe fallback to prevent Node.js ERR_INVALID_CHAR header exceptions
 * while modern browsers receive the complete UTF-8 encoded filename via filename*=UTF-8''.
 */
export function formatContentDisposition(
  rxNumber: string,
  patientName: string,
  disposition: "inline" | "attachment" = "inline"
): string {
  const unicodeName = sanitizeUnicodeFilename(patientName);
  // Strict ASCII-only fallback (letters, digits, underscore, hyphen)
  const asciiName =
    unicodeName
      .replace(/[^\w-]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 40)
      .replace(/^_+|_+$/g, "") || "patient";

  const filenameUtf8 = `Prescription-${rxNumber}-${unicodeName}.pdf`;
  const filenameAscii = `Prescription-${rxNumber}-${asciiName}.pdf`;

  return `${disposition}; filename="${filenameAscii}"; filename*=UTF-8''${encodeURIComponent(filenameUtf8)}`;
}

/**
 * Generates a streaming PDF response for a given prescription detail record.
 * Encapsulates React 19 JSX and @react-pdf/renderer stream conversion.
 */
export async function generatePrescriptionPdfResponse(
  prescription: PrescriptionDetail
): Promise<Response> {
  const rxNumber = `RX-${prescription.id.slice(0, 8).toUpperCase()}`;

  const pdfElement = React.createElement(PrescriptionPdfDocument, {
    prescription: {
      id: prescription.id,
      prescriptionNumber: rxNumber,
      createdAt: prescription.createdAt,
      items: prescription.items,
    },
    patientName: prescription.patient.name,
    patientDob: prescription.patient.dob,
    patientAge: prescription.patient.age,
    patientAddress: prescription.patient.address,
    doctorName: prescription.doctor.name,
    clinicName: prescription.clinic.name,
    clinicAddress: prescription.clinic.address,
    clinicLogoUrl: prescription.clinic.logoUrl,
  });

  // Isolate library type mismatches between React 19 JSX and @react-pdf/renderer
  const nodeStream = await renderToStream(
    pdfElement as unknown as React.ReactElement<Record<string, unknown>>
  );
  const webStream = Readable.toWeb(nodeStream as unknown as Readable);

  return new Response(webStream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": formatContentDisposition(rxNumber, prescription.patient.name, "inline"),
      "Cache-Control": "private, no-cache",
    },
  });
}
