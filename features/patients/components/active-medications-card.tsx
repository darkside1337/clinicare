import React from "react";
import { Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { PrescriptionProfileItem } from "@/features/patients/types";

interface ActiveMedicationsCardProps {
  medications: PrescriptionProfileItem["items"];
}

export function ActiveMedicationsCard({ medications }: ActiveMedicationsCardProps) {
  return (
    <div className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-3">
      <div className="flex items-center justify-between border-b border-primary pb-1.5">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Active Medications
          </h3>
        </div>
        <Badge variant="outline" className="font-mono text-[11px]">
          {medications.length} ACTIVE
        </Badge>
      </div>

      {medications.length === 0 ? (
        <EmptyState className="p-4">
          No active prescribed medications recorded
        </EmptyState>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {medications.map((item, idx) => (
            <div
              key={idx}
              className="border border-neutral-border bg-background p-2.5 text-xs space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{item.medication}</span>
                <span className="font-mono text-[11px] text-text-muted">{item.dosage}</span>
              </div>
              <div className="text-[11px] text-text-muted font-mono">
                {item.frequency} • {item.duration}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
