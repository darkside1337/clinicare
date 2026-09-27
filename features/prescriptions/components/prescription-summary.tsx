"use client";

import React from "react";
import { Printer, Download, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface PrescriptionSummaryItem {
  id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export interface PrescriptionSummaryData {
  id: string;
  prescriptionNumber?: string;
  createdAt?: Date | string;
  issuedAt?: string;
  items?: PrescriptionSummaryItem[];
}

export interface PrescriptionSummaryProps {
  prescription: PrescriptionSummaryData;
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientAddress?: string | null;
  doctorName: string;
  clinicName: string;
  clinicAddress?: string | null;
}

function formatDate(dateVal?: Date | string, fallback?: string): string {
  if (fallback) return fallback;
  if (!dateVal) return "";
  const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function PrescriptionSummary({
  prescription,
  patientName,
  patientDob,
  patientAge,
  patientAddress,
  doctorName,
  clinicName,
  clinicAddress,
}: PrescriptionSummaryProps) {
  const items = prescription?.items || [];
  const rxNumber =
    prescription.prescriptionNumber ||
    `RX-${prescription.id.slice(0, 8).toUpperCase()}`;
  const issueDate = formatDate(prescription.createdAt, prescription.issuedAt);

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Bar (Hidden during print) */}
      <Card className="print:hidden rounded-none flex flex-wrap items-center justify-between gap-3 border border-primary bg-card p-3 shadow-[1px_1px_0px_var(--color-primary)]">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-foreground" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Prescription Pad
          </span>
          <Badge variant="outline" className="font-mono text-[11px] rounded-none">
            {rxNumber}
          </Badge>
          {issueDate && (
            <span className="text-[11px] font-mono text-text-muted">
              Issued: {issueDate}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-none border border-primary bg-card px-3 py-1 text-xs font-mono uppercase font-bold text-foreground hover:bg-background"
          >
            <a
              href={`/prescriptions/${prescription.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </a>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleBrowserPrint}
            className="rounded-none border border-primary bg-primary px-3.5 py-1 text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Print Sheet (Ctrl+P)</span>
          </Button>
        </div>
      </Card>

      {/* The Prescription Sheet */}
      <div
        id="prescription-print-target"
        className="border border-primary bg-card p-6 sm:p-8 shadow-[2px_2px_0px_var(--color-primary)] max-w-3xl mx-auto space-y-6 text-foreground font-sans print:shadow-none print:border-none print:p-0 print:m-0"
      >
        {/* Practice Header */}
        <div className="flex items-start justify-between border-b-2 border-primary pb-4">
          <div className="space-y-0.5">
            <span className="text-sm font-bold uppercase tracking-wider block">
              {clinicName}
            </span>
            {clinicAddress && (
              <span className="text-[11px] font-mono text-text-muted block">
                {clinicAddress}
              </span>
            )}
            <span className="text-[11px] font-mono text-foreground font-bold block uppercase mt-1">
              Outpatient Clinical Prescription
            </span>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="border border-primary bg-background px-2.5 py-1 inline-block">
              <span className="text-[10px] text-text-muted uppercase block">Serial No.</span>
              <strong className="text-foreground text-xs">
                {rxNumber}
              </strong>
            </div>
          </div>
        </div>

        {/* Patient & Prescriber Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-border bg-background p-3 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Patient Identification
            </span>
            <div className="font-bold text-sm text-foreground font-sans">
              {patientName}
            </div>
            <div className="text-text-muted">
              DOB: {patientDob} (Age {patientAge})
            </div>
            {patientAddress && (
              <div className="text-text-muted text-[11px] truncate">
                Address: {patientAddress}
              </div>
            )}
          </div>

          <div className="space-y-1 sm:border-l sm:border-neutral-border sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Prescriber &amp; Issue Details
            </span>
            <div className="font-bold text-foreground">
              {doctorName}
            </div>
            {issueDate && (
              <div className="text-text-muted">
                Issue Date: {issueDate}
              </div>
            )}
            <div className="text-text-muted text-[11px]">
              Type: General Outpatient
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-foreground block border-b border-primary pb-1">
            Prescribed Items &amp; Dosages ({items.length})
          </span>

          <div className="border border-primary overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-primary font-mono text-[11px] uppercase text-text-muted">
                  <th className="py-2 px-3 w-8">#</th>
                  <th className="py-2 px-3">Medication &amp; Strength</th>
                  <th className="py-2 px-3">Dosage / Frequency</th>
                  <th className="py-2 px-3">Duration / Qty</th>
                  <th className="py-2 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-text-muted font-mono">
                      No medications listed
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-mono text-text-muted">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-foreground">
                        {item.medication}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-foreground">
                        {item.dosage} • {item.frequency}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-text-muted">
                        {item.duration}
                      </td>
                      <td className="py-2.5 px-3 italic text-foreground">
                        {item.instructions || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature & Disclaimer Block */}
        <div className="pt-6 border-t-2 border-primary grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="text-[10px] text-text-muted leading-relaxed">
            <p className="font-bold text-foreground uppercase">Legal Dispensing Notice</p>
            <p>
              This prescription is valid for presentation at any licensed pharmacy within the jurisdiction. Dispense as written unless generic substitution is explicitly indicated.
            </p>
          </div>

          <div className="flex flex-col items-end justify-end space-y-1">
            <div className="border-b border-primary w-48 text-right pb-1 font-serif italic text-sm text-foreground">
              {doctorName}
            </div>
            <span className="text-[10px] text-text-muted uppercase">
              Authorized Clinician Signature
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
