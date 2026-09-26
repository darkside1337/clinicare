"use client";

import React from "react";
import Link from "next/link";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientTable } from "@/features/patients/components/patient-table";
import { SearchPatient } from "@/lib/mock-patients-directory";
import type { PatientDirectoryItem } from "@/features/patients/queries";
import type { Patient } from "@/lib/db/schema";

interface PatientsClientProps {
  initialPatients: (SearchPatient | PatientDirectoryItem | Patient)[];
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
}

export function PatientsClient({
  initialPatients,
  sessionRole = "doctor",
  sessionUserName,
}: PatientsClientProps) {
  return (
    <div className="min-h-full bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Main Container */}
      <main className="mx-auto max-w-[1536px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Heading Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141618] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-[#141618]" />
              <h1 className="text-xl font-bold uppercase tracking-wider text-[#141618]">
                Practice Patient Directory
              </h1>
            </div>
            <p className="text-xs text-[#5A5D61] mt-0.5">
              Clinic register for patient search, medical history review, and
              consultation access.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="border border-[#141618] bg-white px-2.5 py-1 text-[11px] font-mono text-[#141618]">
              TOTAL REGISTERED: <strong>{initialPatients.length}</strong>
            </span>
          </div>
        </div>

        {/* Master Clinical Table */}
        <PatientTable initialPatients={initialPatients} />
      </main>
    </div>
  );
}
