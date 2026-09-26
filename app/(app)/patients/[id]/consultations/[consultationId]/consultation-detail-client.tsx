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
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Top Clinical Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 sm:px-6 print:hidden">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono tracking-tight">
          <Link
            href={`/patients/${consultation.patientId}`}
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#141618] hover:opacity-75"
          >
            <ArrowLeft className="size-3.5" />
            <span>PATIENT PROFILE</span>
          </Link>
          <span className="text-[#D8D4CC]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[#5A5D61] uppercase tracking-wider text-[11px]">
              CONSULTATION:
            </span>
            <span className="font-semibold text-[#141618]">{consultation.reference}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentRx && (
            <>
              <Button
                asChild
                variant="outline"
                size="xs"
                className="rounded-none border border-[#141618] bg-white px-2.5 py-1 text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7] flex items-center gap-1.5 h-auto"
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
                className="rounded-none border border-[#141618] bg-[#141618] px-3.5 py-1 text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1.5 h-auto"
              >
                <Printer className="size-3.5" />
                <span>Print Prescription</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Review Workspace */}
      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Document Header & Patient Banner */}
        <div className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141618] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[#141618]" />
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#141618]">
                  Clinical Consultation Record
                </h1>
              </div>
              <p className="text-xs font-mono text-[#5A5D61] mt-0.5">
                REF: {consultation.reference} • DATE: {consultation.consultationDate} at {consultation.time}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">{consultation.encounterType}</Badge>
              <Badge variant="green">COMPLETED</Badge>
            </div>
          </div>

          {/* Patient Quick Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAFAF7] border border-[#D8D4CC] p-3 text-xs font-mono">
            <div>
              <span className="text-[11px] text-[#5A5D61] uppercase block">Patient</span>
              <Link
                href={`/patients/${consultation.patientId}`}
                className="font-bold text-[#141618] hover:underline"
              >
                {consultation.patientName} ({consultation.patientAge}y • DOB: {consultation.patientDob})
              </Link>
            </div>

            <div>
              <span className="text-[11px] text-[#5A5D61] uppercase block">Sex</span>
              <strong className="text-[#141618]">{consultation.patientSex}</strong>
            </div>

            <div>
              <span className="text-[11px] text-[#5A5D61] uppercase block">Attending Clinician</span>
              <strong className="text-[#141618]">{consultation.doctorName}</strong>
            </div>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center border border-[#141618] bg-white p-0.5 text-xs font-mono">
            <Button
              type="button"
              variant={activeTab === "notes" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("notes")}
              className={`flex-1 rounded-none uppercase font-bold text-xs ${
                activeTab === "notes"
                  ? "bg-[#141618] text-[#FAFAF7] hover:bg-black"
                  : "text-[#5A5D61] hover:text-[#141618] hover:bg-[#FAFAF7]"
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
                  ? "bg-[#141618] text-[#FAFAF7] hover:bg-black"
                  : "text-[#5A5D61] hover:text-[#141618] hover:bg-[#FAFAF7]"
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
            <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618]">
                  1. Chief Complaint
                </h2>
                <span className="text-[11px] font-mono text-[#5A5D61]">PRESENTING ISSUE</span>
              </div>
              <p className="text-sm font-bold text-[#141618] pt-1">
                {consultation.chiefComplaint}
              </p>
            </section>

            {/* 2. Symptoms */}
            <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618]">
                  2. Symptoms &amp; History
                </h2>
                <span className="text-[11px] font-mono text-[#5A5D61]">PATIENT REPORTED</span>
              </div>
              <p className="text-xs text-[#141618] leading-relaxed bg-[#FAFAF7] p-3 border border-[#EFECE6]">
                {consultation.symptoms}
              </p>
            </section>

            {/* 3. Observations */}
            <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618]">
                  3. Clinical Observations &amp; Examination
                </h2>
                <span className="text-[11px] font-mono text-[#5A5D61]">FREE-TEXT CLINICAL FINDINGS</span>
              </div>
              <div className="text-xs text-[#141618] bg-[#FAFAF7] p-3 border border-[#EFECE6] leading-relaxed font-mono">
                {consultation.observations}
              </div>
            </section>

            {/* 4. Diagnosis */}
            <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618]">
                  4. Diagnosis / Working Assessment
                </h2>
                <span className="text-[11px] font-mono text-[#166534] font-bold">VERIFIED</span>
              </div>
              <div className="border border-[#166534] bg-[#F0FDF4] p-3">
                <p className="text-sm font-bold text-[#141618]">
                  {consultation.diagnosis}
                </p>
              </div>
            </section>

            {/* 5. Treatment */}
            <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618]">
                  5. Treatment Plan
                </h2>
                <span className="text-[11px] font-mono text-[#5A5D61]">THERAPY &amp; MANAGEMENT</span>
              </div>
              <p className="text-xs text-[#141618] leading-relaxed bg-[#FAFAF7] p-3 border border-[#EFECE6]">
                {consultation.treatment}
              </p>
            </section>

            {/* 6. Notes */}
            {consultation.notes && (
              <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-2">
                <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618]">
                    6. Clinical Notes &amp; Follow-up Advice
                  </h2>
                  <span className="text-[11px] font-mono text-[#5A5D61]">INTERNAL RECORD</span>
                </div>
                <p className="text-xs text-[#141618] leading-relaxed bg-[#FAFAF7] p-3 border border-[#EFECE6] italic">
                  {consultation.notes}
                </p>
              </section>
            )}

            {/* Attached Prescriptions Quick Access */}
            {prescriptions.length > 0 && (
              <div className="border border-[#141618] bg-[#F0EFEA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Pill className="size-4 text-[#141618]" />
                  <div>
                    <span className="text-xs font-bold text-[#141618] block">
                      {prescriptions.length} Prescription{prescriptions.length > 1 ? "s" : ""} Attached
                    </span>
                    <span className="text-[11px] font-mono text-[#5A5D61]">
                      Click to review prescription pads and export print PDFs
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setActiveTab("prescriptions")}
                  className="rounded-none border border-[#141618] bg-white text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7]"
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
      </main>
    </div>
  );
}
