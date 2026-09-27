"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Pill,
  Printer,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  ClinicalConsultationDetail,
  ConsultationPrescription,
} from "@/features/consultations/types";
import { PrescriptionList } from "@/features/prescriptions/components/prescription-list";

interface ConsultationDetailClientProps {
  consultation: ClinicalConsultationDetail;
}

export function ConsultationDetailClient({
  consultation,
}: ConsultationDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "prescriptions">("notes");

  const prescriptions = consultation.prescriptions || [];
  const currentRx: ConsultationPrescription | undefined = prescriptions[0];

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sub-Header Navigation */}
      <div className="border-b border-primary bg-card px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono tracking-tight">
          <Button asChild variant="ghost" size="xs" className="rounded-none text-xs font-mono uppercase">
            <Link
              href={`/patients/${consultation.patientId}`}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Profile</span>
            </Link>
          </Button>
          <span className="text-neutral-border">|</span>
          <div className="flex items-center gap-2">
            <span className="text-text-muted uppercase tracking-wider text-[11px]">
              CONSULTATION:
            </span>
            <span className="font-semibold text-foreground">{consultation.reference}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentRx && (
            <>
              <Button
                asChild
                variant="outline"
                size="xs"
                className="rounded-none border border-primary bg-card px-2.5 py-1 text-xs font-mono uppercase font-bold text-foreground hover:bg-muted flex items-center gap-1.5 h-auto"
              >
                <a
                  href={`/prescriptions/${currentRx.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <Download className="size-3.5" />
                  <span>Export Prescription PDF</span>
                </a>
              </Button>

              <Button
                type="button"
                variant="default"
                size="xs"
                onClick={() => {
                  setActiveTab("prescriptions");
                  setTimeout(() => window.print(), 100);
                }}
                className="rounded-none border border-primary bg-primary px-3.5 py-1 text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 h-auto"
              >
                <Printer className="size-3.5" />
                <span>Print Prescription</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Review Workspace */}
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Document Header & Patient Banner */}
        <div className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-foreground" />
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">
                  Clinical Consultation Record
                </h1>
              </div>
              <p className="text-xs font-mono text-text-muted mt-0.5">
                REF: {consultation.reference} • DATE: {consultation.consultationDate} at {consultation.time}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">{consultation.encounterType}</Badge>
              <Badge variant="green">COMPLETED</Badge>
            </div>
          </div>

          {/* Patient Quick Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-background border border-neutral-border p-3 text-xs font-mono">
            <div>
              <span className="text-[11px] text-text-muted uppercase block">Patient</span>
              <Link
                href={`/patients/${consultation.patientId}`}
                className="font-bold text-foreground hover:underline"
              >
                {consultation.patientName} ({consultation.patientAge}y • DOB: {consultation.patientDob})
              </Link>
            </div>

            <div>
              <span className="text-[11px] text-text-muted uppercase block">Sex</span>
              <strong className="text-foreground">{consultation.patientSex}</strong>
            </div>

            <div>
              <span className="text-[11px] text-text-muted uppercase block">Attending Clinician</span>
              <strong className="text-foreground">{consultation.doctorName}</strong>
            </div>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center border border-primary bg-card p-0.5 text-xs font-mono">
            <Button
              type="button"
              variant={activeTab === "notes" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("notes")}
              className={`flex-1 rounded-none uppercase font-bold text-xs ${
                activeTab === "notes"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-text-muted hover:text-foreground hover:bg-muted"
              }`}
            >
              1. Consultation Notes (PRD Core Fields)
            </Button>

            <Button
              type="button"
              variant={activeTab === "prescriptions" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("prescriptions")}
              className={`flex-1 rounded-none uppercase font-bold text-xs flex items-center justify-center gap-1.5 ${
                activeTab === "prescriptions"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-text-muted hover:text-foreground hover:bg-muted"
              }`}
            >
              <Pill className="size-3.5" />
              <span>2. Prescriptions ({prescriptions.length})</span>
            </Button>
          </div>
        </div>

        {/* TAB 1: FREE-TEXT CLINICAL CONSULTATION FIELDS (Per PRD §8.6) */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            {/* 1. Chief Complaint */}
            <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  1. Chief Complaint
                </h2>
                <span className="text-[11px] font-mono text-text-muted">PRESENTING ISSUE</span>
              </div>
              <p className="text-sm font-bold text-foreground pt-1">
                {consultation.chiefComplaint}
              </p>
            </section>

            {/* 2. Symptoms */}
            <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  2. Symptoms &amp; History
                </h2>
                <span className="text-[11px] font-mono text-text-muted">PATIENT REPORTED</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed bg-background p-3 border border-neutral-border">
                {consultation.symptoms}
              </p>
            </section>

            {/* 3. Observations */}
            <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  3. Clinical Observations &amp; Examination
                </h2>
                <span className="text-[11px] font-mono text-text-muted">FREE-TEXT CLINICAL FINDINGS</span>
              </div>
              <div className="text-xs text-foreground bg-background p-3 border border-neutral-border leading-relaxed font-mono">
                {consultation.observations}
              </div>
            </section>

            {/* 4. Diagnosis */}
            <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  4. Diagnosis / Working Assessment
                </h2>
                <span className="text-[11px] font-mono text-clinical-resolved font-bold">VERIFIED</span>
              </div>
              <div className="border border-clinical-resolved bg-clinical-resolved-bg p-3">
                <p className="text-sm font-bold text-foreground">
                  {consultation.diagnosis}
                </p>
              </div>
            </section>

            {/* 5. Treatment */}
            <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  5. Treatment Plan
                </h2>
                <span className="text-[11px] font-mono text-text-muted">THERAPY &amp; MANAGEMENT</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed bg-background p-3 border border-neutral-border">
                {consultation.treatment}
              </p>
            </section>

            {/* 6. Notes */}
            {consultation.notes && (
              <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                    6. Clinical Notes &amp; Follow-up Advice
                  </h2>
                  <span className="text-[11px] font-mono text-text-muted">INTERNAL RECORD</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed bg-background p-3 border border-neutral-border italic">
                  {consultation.notes}
                </p>
              </section>
            )}

            {/* Attached Prescriptions Quick Access */}
            {prescriptions.length > 0 && (
              <div className="border border-primary bg-muted p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Pill className="size-4 text-foreground" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {prescriptions.length} Prescription{prescriptions.length > 1 ? "s" : ""} Attached
                    </span>
                    <span className="text-[11px] font-mono text-text-muted">
                      Click to review prescription pads and export print PDFs
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setActiveTab("prescriptions")}
                  className="rounded-none border border-primary bg-card text-xs font-mono uppercase font-bold text-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  View Prescriptions ({prescriptions.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MULTI-PRESCRIPTION DISPLAY & PRINT SHEETS */}
        {activeTab === "prescriptions" && (
          <PrescriptionList
            prescriptions={prescriptions}
            patientName={consultation.patientName}
            patientDob={consultation.patientDob}
            patientAge={consultation.patientAge}
            patientAddress={consultation.patientContact?.address}
            doctorName={consultation.doctorName}
            clinicName={consultation.clinicName}
            clinicAddress={consultation.clinicAddress}
            patientId={consultation.patientId}
            consultationId={consultation.id}
          />
        )}
      </div>
    </div>
  );
}
