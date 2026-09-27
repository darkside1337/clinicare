"use client";

import React, { useState } from "react";
import { Plus, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PrescriptionSummary,
  type PrescriptionSummaryData,
} from "./prescription-summary";
import { PrescriptionForm } from "./prescription-form";
import type { PrescriptionWithItems } from "../queries";
import { formatRxNumber } from "@/features/prescriptions/presenters";

interface PrescriptionListProps {
  prescriptions: PrescriptionSummaryData[];
  patientName: string;
  patientDob: string;
  patientAge: number;
  patientAddress?: string | null;
  doctorName: string;
  clinicName: string;
  clinicAddress?: string | null;
  patientId?: string;
  consultationId?: string;
  onPrescriptionCreated?: (prescription: PrescriptionWithItems) => void;
}

export function PrescriptionList({
  prescriptions: initialPrescriptions,
  patientName,
  patientDob,
  patientAge,
  patientAddress,
  doctorName,
  clinicName,
  clinicAddress,
  patientId,
  consultationId,
  onPrescriptionCreated,
}: PrescriptionListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionSummaryData[]>(
    initialPrescriptions ?? []
  );
  const [prevInitial, setPrevInitial] =
    useState<PrescriptionSummaryData[]>(initialPrescriptions);

  // Sync if prop updates (render-time adjustment, avoids setState-in-effect)
  if (initialPrescriptions !== prevInitial) {
    setPrevInitial(initialPrescriptions);
    setPrescriptions(initialPrescriptions ?? []);
  }

  const handleCreated = (newRx: PrescriptionWithItems) => {
    const summaryData: PrescriptionSummaryData = {
      id: newRx.id,
      prescriptionNumber: formatRxNumber(newRx.id),
      createdAt: newRx.createdAt,
      items: newRx.items,
    };
    const updated = [summaryData, ...prescriptions];
    setPrescriptions(updated);
    setSelectedIndex(0);
    setShowAddForm(false);
    if (onPrescriptionCreated) {
      onPrescriptionCreated(newRx);
    }
  };

  const currentRx = prescriptions[selectedIndex] || prescriptions[0];

  return (
    <div className="space-y-4">
      {/* Action / Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-primary bg-card p-3 shadow-[1px_1px_0px_var(--color-primary)]">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-foreground" />
          <span className="font-mono text-xs uppercase font-bold text-foreground">
            Encounter Prescriptions
          </span>
          <Badge variant="outline" className="font-mono text-[11px] rounded-none">
            {prescriptions.length} Order{prescriptions.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {patientId && consultationId && (
          <Button
            type="button"
            variant={showAddForm ? "outline" : "default"}
            size="xs"
            onClick={() => setShowAddForm(!showAddForm)}
            className={`rounded-none text-xs font-mono uppercase font-bold flex items-center gap-1.5 ${
              showAddForm
                ? "border border-primary text-foreground hover:bg-background"
                : "bg-primary text-primary-foreground hover:bg-black"
            }`}
          >
            <Plus className="size-3" />
            <span>{showAddForm ? "Cancel Add" : "+ Issue Additional Prescription"}</span>
          </Button>
        )}
      </div>

      {/* Add Form Drawer/Pad */}
      {showAddForm && patientId && consultationId && (
        <PrescriptionForm
          patientId={patientId}
          consultationId={consultationId}
          title="New Prescription Pad"
          onSuccess={handleCreated}
        />
      )}

      {/* Multi-Prescription Tab Switcher */}
      {prescriptions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border border-primary bg-card p-2 text-xs font-mono">
          <span className="font-bold text-text-muted uppercase text-[11px] mr-2">
            Select Order:
          </span>
          {prescriptions.map((rx, idx) => (
            <Button
              key={rx.id}
              type="button"
              variant={selectedIndex === idx ? "default" : "outline"}
              size="xs"
              onClick={() => {
                setSelectedIndex(idx);
                setShowAddForm(false);
              }}
              className={`rounded-none font-mono text-xs uppercase ${
                selectedIndex === idx
                  ? "bg-primary text-primary-foreground hover:bg-black"
                  : "border-primary text-foreground hover:bg-background"
              }`}
            >
              Order #{idx + 1} ({rx.prescriptionNumber || rx.id.slice(0, 8)})
            </Button>
          ))}
        </div>
      )}

      {prescriptions.length === 0 && !showAddForm ? (
        <div className="border border-dashed border-neutral-border bg-card p-8 text-center text-xs font-mono text-text-muted space-y-3">
          <p>No prescriptions have been issued for this consultation encounter yet.</p>
          {patientId && consultationId && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="rounded-none border border-primary bg-primary text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-black inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Issue First Prescription</span>
            </Button>
          )}
        </div>
      ) : (
        currentRx && (
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
        )
      )}
    </div>
  );
}
