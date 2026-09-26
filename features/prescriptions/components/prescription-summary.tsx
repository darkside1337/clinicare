"use client";

import React, { useState } from "react";
import { Printer, Download, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Prescription } from "@/lib/mock-consultations";
import PrescriptionPdfDocument from "@/features/prescriptions/pdf/prescription-document";

interface PrescriptionSummaryProps {
  prescription: Prescription;
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientAddress?: string;
  doctorName: string;
  clinicName: string;
  clinicAddress?: string;
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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const items = prescription?.items || [];

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <PrescriptionPdfDocument
          prescription={prescription}
          patientName={patientName}
          patientDob={patientDob}
          patientAge={patientAge}
          patientAddress={patientAddress}
          doctorName={doctorName}
          clinicName={clinicName}
          clinicAddress={clinicAddress}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Prescription-${prescription.prescriptionNumber || prescription.id}-${patientName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Bar (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border border-[#141618] bg-white p-3 shadow-[1px_1px_0px_#141618]">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-[#141618]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618]">
            Prescription Pad
          </span>
          <Badge variant="outline" className="font-mono text-[11px]">
            {prescription.prescriptionNumber || prescription.id}
          </Badge>
          <span className="text-[11px] font-mono text-[#5A5D61]">
            Issued: {prescription.issuedAt}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="rounded-none border border-[#141618] bg-white px-3 py-1 text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7] flex items-center gap-1.5"
          >
            <Download className="size-3.5" />
            <span>{isExportingPdf ? "Exporting PDF..." : "Download PDF"}</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleBrowserPrint}
            className="rounded-none border border-[#141618] bg-[#141618] px-3.5 py-1 text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Print Sheet (Ctrl+P)</span>
          </Button>
        </div>
      </div>

      {/* The Prescription Sheet */}
      <div
        id="prescription-print-target"
        className="border border-[#141618] bg-white p-6 sm:p-8 shadow-[2px_2px_0px_#141618] max-w-3xl mx-auto space-y-6 text-[#141618] font-sans print:shadow-none print:border-none print:p-0 print:m-0"
      >
        {/* Practice Header */}
        <div className="flex items-start justify-between border-b-2 border-[#141618] pb-4">
          <div className="space-y-0.5">
            <span className="text-sm font-bold uppercase tracking-wider block">
              {clinicName}
            </span>
            {clinicAddress && (
              <span className="text-[11px] font-mono text-[#5A5D61] block">
                {clinicAddress}
              </span>
            )}
            <span className="text-[11px] font-mono text-[#141618] font-bold block uppercase mt-1">
              Outpatient Clinical Prescription
            </span>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="border border-[#141618] bg-[#FAFAF7] px-2.5 py-1 inline-block">
              <span className="text-[10px] text-[#5A5D61] uppercase block">Serial No.</span>
              <strong className="text-[#141618] text-xs">
                {prescription.prescriptionNumber || prescription.id}
              </strong>
            </div>
          </div>
        </div>

        {/* Patient & Prescriber Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#D8D4CC] bg-[#FAFAF7] p-3 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#5A5D61] block">
              Patient Identification
            </span>
            <div className="font-bold text-sm text-[#141618] font-sans">
              {patientName}
            </div>
            <div className="text-[#5A5D61]">
              DOB: {patientDob} (Age {patientAge})
            </div>
            {patientAddress && (
              <div className="text-[#5A5D61] text-[11px] truncate">
                Address: {patientAddress}
              </div>
            )}
          </div>

          <div className="space-y-1 sm:border-l sm:border-[#D8D4CC] sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-[#5A5D61] block">
              Prescriber &amp; Issue Details
            </span>
            <div className="font-bold text-[#141618]">
              {doctorName}
            </div>
            <div className="text-[#5A5D61]">
              Issue Date: {prescription.issuedAt}
            </div>
            <div className="text-[#5A5D61] text-[11px]">
              Type: General Outpatient
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#141618] block border-b border-[#141618] pb-1">
            Prescribed Items &amp; Dosages ({items.length})
          </span>

          <div className="border border-[#141618] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF7] border-b border-[#141618] font-mono text-[11px] uppercase text-[#5A5D61]">
                  <th className="py-2 px-3 w-8">#</th>
                  <th className="py-2 px-3">Medication &amp; Strength</th>
                  <th className="py-2 px-3">Dosage / Frequency</th>
                  <th className="py-2 px-3">Duration / Qty</th>
                  <th className="py-2 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D4CC]">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[#5A5D61] font-mono">
                      No medications listed
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#FAFAF7]">
                      <td className="py-2.5 px-3 font-mono text-[#5A5D61]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-[#141618]">
                        {item.medication}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#141618]">
                        {item.dosage} • {item.frequency}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#5A5D61]">
                        {item.duration}
                      </td>
                      <td className="py-2.5 px-3 italic text-[#141618]">
                        {item.instructions}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature & Disclaimer Block */}
        <div className="pt-6 border-t-2 border-[#141618] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="text-[10px] text-[#5A5D61] leading-relaxed">
            <p className="font-bold text-[#141618] uppercase">Legal Dispensing Notice</p>
            <p>
              This prescription is valid for presentation at any licensed pharmacy within the jurisdiction. Dispense as written unless generic substitution is explicitly indicated.
            </p>
          </div>

          <div className="flex flex-col items-end justify-end space-y-1">
            <div className="border-b border-[#141618] w-48 text-right pb-1 font-serif italic text-sm text-[#141618]">
              {doctorName}
            </div>
            <span className="text-[10px] text-[#5A5D61] uppercase">
              Authorized Clinician Signature
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
