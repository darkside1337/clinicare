import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientForm } from "@/features/patients/components/patient-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Register New Patient | CliniCare",
  description: "New patient medical intake and registration form",
};

export default async function NewPatientPage() {
  await getSession();

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sub-header navigation row */}
      <div className="border-b border-primary bg-card px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="xs" className="rounded-none text-xs font-mono uppercase">
          <Link href="/patients" className="flex items-center gap-1.5">
            <ArrowLeft className="size-3.5" />
            <span>Back to Patient Directory</span>
          </Link>
        </Button>
        <Badge variant="outline" className="font-mono text-xs">
          INTAKE WORKSTATION
        </Badge>
      </div>

      {/* Main Intake Form Container */}
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Form Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-foreground" />
              <h1 className="text-xl font-bold uppercase tracking-wider text-foreground">
                New Patient Registration Form
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Enter core demographics and contact information. Allergies and problem lists are managed on the patient record.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            PATIENT INTAKE
          </Badge>
        </div>

        {/* Patient Registration Form */}
        <PatientForm />
      </div>
    </div>
  );
}
