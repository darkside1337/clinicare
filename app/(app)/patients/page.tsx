import React from "react";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listPatients, listPatientsDirectory } from "@/features/patients/queries";
import { PatientTable } from "@/features/patients/components/patient-table";

export const metadata: Metadata = {
  title: "Patients Directory | CliniCare",
  description: "Master clinical register of all clinic patients",
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getSession();
  const { search } = await searchParams;
  const isDoctor = session.role === "doctor";

  // Doctors receive directory with allergy flags & active conditions.
  // Receptionists receive basic patient demographics without running clinical sub-queries.
  const patientsData = isDoctor
    ? await listPatientsDirectory(session.clinicId, session.role, search?.trim() || undefined)
    : await listPatients(session.clinicId, search?.trim() || undefined);

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Main Container */}
      <div className="mx-auto max-w-[1536px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Heading Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-foreground" />
              <h1 className="text-xl font-bold uppercase tracking-wider text-foreground">
                Practice Patient Directory
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Clinic register for patient search, medical history review, and
              consultation access.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="border border-primary bg-card px-2.5 py-1 text-[11px] font-mono text-foreground tabular-nums">
              TOTAL REGISTERED: <strong>{patientsData.length}</strong>
            </span>
          </div>
        </div>

        {/* Master Clinical Table (client boundary lives in PatientTable) */}
        <PatientTable initialPatients={patientsData} role={session.role} />
      </div>
    </div>
  );
}
