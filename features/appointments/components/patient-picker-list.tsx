import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FormPatient } from "@/features/appointments/constants";

interface PatientPickerListProps {
  patients: FormPatient[];
  selectedPatientId?: string;
  onSelectPatient: (patientId: string) => void;
  emptyMessage?: string;
  groupId?: string;
}

export function PatientPickerList({
  patients,
  selectedPatientId,
  onSelectPatient,
  emptyMessage = "No patients registered. Please register a patient before booking.",
  groupId,
}: PatientPickerListProps) {
  return (
    <div
      role="group"
      aria-labelledby={groupId}
      className="border border-primary bg-background p-1.5 max-h-36 overflow-y-auto divide-y divide-neutral-border"
    >
      {patients.length === 0 ? (
        <div className="p-3 text-center text-xs font-mono text-text-muted">
          {emptyMessage}
        </div>
      ) : (
        patients.map((p) => {
          const isSelected = selectedPatientId === p.id;
          return (
            <Button
              key={p.id}
              type="button"
              variant="ghost"
              onClick={() => onSelectPatient(p.id)}
              className={`w-full justify-between rounded-none p-2 h-auto text-xs font-mono transition-colors text-left ${
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "hover:bg-card text-foreground"
              }`}
            >
              <div className="truncate">
                <span className="font-bold">{p.name}</span>
                <span className="text-[11px] opacity-75 ml-2">
                  ({p.id} • {p.dob})
                </span>
              </div>
              {p.hasSevereAllergy && (
                <Badge
                  variant="destructive"
                  aria-label="Severe allergy recorded"
                  className={`text-[10px] uppercase font-bold shrink-0 ml-2 ${
                    isSelected ? "bg-card text-clinical-critical" : ""
                  }`}
                >
                  Allergy
                </Badge>
              )}
            </Button>
          );
        })
      )}
    </div>
  );
}
