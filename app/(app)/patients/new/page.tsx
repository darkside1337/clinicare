import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PatientForm } from "@/features/patients/components/patient-form";

export const metadata: Metadata = {
  title: "Register New Patient | CliniCare",
  description: "New patient medical intake and registration form",
};

export default function NewPatientPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Top Clinical Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono tracking-tight">
          <Link
            href="/patients"
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#141618] hover:opacity-75 transition-opacity"
          >
            <ArrowLeft className="size-3.5" />
            <span>PATIENT DIRECTORY</span>
          </Link>
          <span className="text-[#D8D4CC] hidden sm:inline">|</span>
          <span className="text-[#5A5D61] uppercase tracking-wider text-[11px]">
            NEW PATIENT REGISTRATION
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#5A5D61]">DATE: 24/09/2026</span>
        </div>
      </header>

      {/* Main Intake Form Container */}
      <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Form Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141618] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-[#141618]" />
              <h1 className="text-xl font-bold uppercase tracking-wider text-[#141618]">
                New Patient Registration Form
              </h1>
            </div>
            <p className="text-xs text-[#5A5D61] mt-0.5">
              Enter core demographics, contact information, known allergies, and problem list.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            PATIENT INTAKE
          </Badge>
        </div>

        {/* Patient Registration Form */}
        <PatientForm />
      </main>
    </div>
  );
}
