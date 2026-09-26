import { NextRequest } from "next/server";
import { requireDoctor, ForbiddenError } from "@/lib/auth/require-doctor";
import { getPrescription } from "@/features/prescriptions/queries";
import { generatePrescriptionPdfResponse } from "@/features/prescriptions/pdf/generate-prescription-pdf";

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

    return await generatePrescriptionPdfResponse(prescription);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return new Response("Forbidden: Doctor role required", { status: 403 });
    }
    console.error("PDF generation failed:", error);
    return new Response("Failed to generate prescription PDF", { status: 500 });
  }
}
