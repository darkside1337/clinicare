"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Prescription } from "@/lib/mock-consultations";
import { PrescriptionSummary } from "./prescription-summary";

interface PrescriptionListProps {
  prescriptions: Prescription[];
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientAddress?: string;
  doctorName: string;
  clinicName: string;
  clinicAddress?: string;
}

export function PrescriptionList({
  prescriptions,
  patientName,
  patientDob,
  patientAge,
  patientAddress,
  doctorName,
  clinicName,
  clinicAddress,
}: PrescriptionListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="border border-dashed border-[#D8D4CC] bg-white p-8 text-center text-xs font-mono text-[#5A5D61]">
        No prescriptions attached to this consultation record.
      </div>
    );
  }

  const currentRx = prescriptions[selectedIndex] || prescriptions[0];

  return (
    <div className="space-y-4">
      {/* Multi-Prescription Tab Switcher */}
      {prescriptions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border border-[#141618] bg-white p-2 text-xs font-mono">
          <span className="font-bold text-[#5A5D61] uppercase text-[11px] mr-2">
            Select Prescription:
          </span>
          {prescriptions.map((rx, idx) => (
            <Button
              key={rx.id}
              type="button"
              variant={selectedIndex === idx ? "default" : "outline"}
              size="xs"
              onClick={() => setSelectedIndex(idx)}
              className={`rounded-none font-mono text-xs uppercase ${
                selectedIndex === idx
                  ? "bg-[#141618] text-[#FAFAF7] hover:bg-black"
                  : "border-[#141618] text-[#141618] hover:bg-[#FAFAF7]"
              }`}
            >
              Prescription #{idx + 1} ({rx.prescriptionNumber || rx.id})
            </Button>
          ))}
        </div>
      )}

      {currentRx && (
        <PrescriptionSummary
          prescription={currentRx}
          patientName={patientName}
          patientDob={patientDob}
          patientAge={patientAge}
          patientAddress={patientAddress}
          doctorName={doctorName}
          clinicName={clinicName}
          clinicAddress={clinicAddress}
        />
      )}
    </div>
  );
}
