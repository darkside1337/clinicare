"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationForm } from "@/features/consultations/components/consultation-form";
import { PrescriptionForm } from "@/features/prescriptions/components/prescription-form";
import type { PrescriptionItemDraft } from "@/features/prescriptions/types";
import type { Patient, Consultation } from "@/lib/db/schema";

interface ConsultationNewClientProps {
  patient: Patient;
  appointmentId?: string;
  doctorName?: string;
}

export function ConsultationNewClient({
  patient,
  appointmentId,
  doctorName,
}: ConsultationNewClientProps) {
  const router = useRouter();
  const [prescriptionItems, setPrescriptionItems] = useState<
    PrescriptionItemDraft[]
  >([]);

  const handleSuccess = (consultation: Consultation) => {
    router.push(`/patients/${patient.id}/consultations/${consultation.id}`);
  };

  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sub-header row */}
      <div className="border-b border-primary bg-card px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          <Button asChild variant="ghost" size="xs" className="rounded-none text-xs font-mono uppercase">
            <Link href={`/patients/${patient.id}`} className="flex items-center gap-1.5">
              <ArrowLeft className="size-3.5" />
              <span>Back to Profile</span>
            </Link>
          </Button>
          <span className="text-neutral-border hidden sm:inline">|</span>
          <span className="text-text-muted uppercase tracking-wider">
            NEW CLINICAL ENCOUNTER: <strong className="text-foreground">{patient.name}</strong> ({patient.id.slice(0, 8)}…)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-text-muted hidden sm:inline tabular-nums">
            DATE: {todayDate}
          </span>
          <Button
            form="consultation-form"
            type="submit"
            size="sm"
            className="rounded-none border border-primary bg-primary text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
          >
            <Save className="size-3.5" />
            <span>Complete &amp; Save Record</span>
          </Button>
        </div>
      </div>

      {/* Main Full-Page Form (Per PRD §8.6 / §12: dedicated uninterrupted full-page, never modal) */}
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-10 space-y-8">
        <div className="border-b border-primary pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                FULL-PAGE CLINICAL CONSULTATION FORM
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                New Clinical Consultation Record
              </h1>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="border border-primary bg-card px-2 py-0.5 text-xs font-mono uppercase">
                Doctor: {doctorName || "Attending Doctor"}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Free-Text Consultation Form (PRD §8.6) */}
        <ConsultationForm
          patientId={patient.id}
          appointmentId={appointmentId}
          doctorName={doctorName}
          encounterType={appointmentId ? "Scheduled" : "Walk-In"}
          prescriptionItems={prescriptionItems}
          onSuccess={handleSuccess}
        />

        {/* 2. Attached Prescriptions Generator (PRD §8.7 — Phase 6 scaffold) */}
        <PrescriptionForm
          items={prescriptionItems}
          onChange={setPrescriptionItems}
          title="Attached Prescription Items"
        />
      </div>
    </div>
  );
}
