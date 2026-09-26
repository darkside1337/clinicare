import React from "react";
import { NextRequest } from "next/server";
import { Readable } from "node:stream";
import { renderToStream } from "@react-pdf/renderer";
import { requireDoctor, ForbiddenError } from "@/lib/auth/require-doctor";
import { getPrescription } from "@/features/prescriptions/queries";
import PrescriptionPdfDocument from "@/features/prescriptions/pdf/prescription-document";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireDoctor();
    const { id } = await context.params;

    const prescription = await getPrescription(session.clinicId, id);

    if (!prescription) {
      return new Response("Prescription not found", { status: 404 });
    }

    const rxNumber = `RX-${prescription.id.slice(0, 8).toUpperCase()}`;
    const safePatientName = prescription.patient.name.replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );

    const pdfDocument = React.createElement(PrescriptionPdfDocument, {
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
    });

    const nodeStream = await renderToStream(
      pdfDocument as unknown as React.ReactElement<any>
    );
    const webStream = Readable.toWeb(nodeStream as unknown as Readable);

    return new Response(webStream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Prescription-${rxNumber}-${safePatientName}.pdf"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return new Response("Forbidden: Doctor role required", { status: 403 });
    }
    console.error("PDF generation failed:", error);
    return new Response("Failed to generate prescription PDF", { status: 500 });
  }
}
