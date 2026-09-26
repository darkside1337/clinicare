"use client";

import React from "react";
import Link from "next/link";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientTable } from "@/features/patients/components/patient-table";
import { SearchPatient } from "@/lib/mock-patients-directory";
import type { PatientDirectoryItem } from "@/features/patients/queries";
import type { Patient } from "@/lib/db/schema";
import { PracticeNav } from "@/components/layout/nav";

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
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Top Clinical Navigation Bar */}
      <PracticeNav
        sessionRole={sessionRole}
        sessionUserName={sessionUserName}
        rightSlot={
          <>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("clinicare:open-search"))
              }
              className="hidden sm:flex items-center gap-1.5 rounded-none border border-[#141618] bg-white px-2.5 py-1 text-xs font-mono text-[#5A5D61] hover:bg-[#FAFAF7] hover:text-[#141618] h-auto"
            >
              <Search className="size-3.5 text-[#141618]" />
              <span>Search (Cmd+K)</span>
            </Button>

            <Button
              asChild
              className="min-h-[36px] rounded-none border border-[#141618] bg-[#141618] px-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAFAF7] transition-colors hover:bg-black"
            >
              <Link href="/patients/new">
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Register New Patient</span>
              </Link>
            </Button>
          </>
        }
      />

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
