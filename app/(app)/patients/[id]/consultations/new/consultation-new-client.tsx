"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationForm } from "@/features/consultations/components/consultation-form";
import {
  PrescriptionForm,
  type PrescriptionItemDraft,
} from "@/features/prescriptions/components/prescription-form";
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
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          <Link
            href={`/patients/${patient.id}`}
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#141618] hover:opacity-75 transition-opacity"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Profile</span>
          </Link>
          <span className="text-[#D8D4CC] hidden sm:inline">|</span>
          <span className="text-[#5A5D61] uppercase tracking-wider">
            NEW CLINICAL ENCOUNTER: <strong>{patient.name}</strong> ({patient.id.slice(0, 8)}…)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#5A5D61] hidden sm:inline">
            DATE: {todayDate}
          </span>
          <Button
            form="consultation-form"
            type="submit"
            size="sm"
            className="rounded-none border border-[#141618] bg-[#141618] text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1.5"
          >
            <Save className="size-3.5" />
            <span>Complete &amp; Save Record</span>
          </Button>
        </div>
      </header>

      {/* Main Full-Page Form (Per PRD §8.6 / §12: dedicated uninterrupted full-page, never modal) */}
      <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-10 space-y-8">
        <div className="border-b border-[#141618] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A5D61]">
                FULL-PAGE CLINICAL CONSULTATION FORM
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#141618]">
                New Clinical Consultation Record
              </h1>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="border border-[#141618] bg-white px-2 py-0.5 text-xs font-mono uppercase">
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
          onSuccess={handleSuccess}
        />

        {/* 2. Attached Prescriptions Generator (PRD §8.7 — Phase 6 scaffold) */}
        <PrescriptionForm
          items={prescriptionItems}
          onChange={setPrescriptionItems}
          title="Attached Prescription Items"
        />

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <Button
            form="consultation-form"
            type="submit"
            size="sm"
            className="rounded-none border border-[#141618] bg-[#141618] px-5 py-2 text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1.5"
          >
            <Save className="size-3.5" />
            <span>Complete &amp; Save Record</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
