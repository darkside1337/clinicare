import React from "react";
import { Button } from "@/components/ui/button";
import type { FormDoctor } from "@/features/appointments/constants";

interface DoctorGridPickerProps {
  doctors: FormDoctor[];
  selectedDoctorId?: string;
  onSelectDoctor: (doctorId: string) => void;
  groupId?: string;
  className?: string;
}

export function DoctorGridPicker({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  groupId,
  className = "grid grid-cols-1 sm:grid-cols-3 gap-2",
}: DoctorGridPickerProps) {
  return (
    <div role="group" aria-labelledby={groupId} className={className}>
      {doctors.length === 0 ? (
        <div className="col-span-1 sm:col-span-3 border border-primary bg-background p-3 text-center text-xs font-mono text-text-muted">
          No practitioners registered in clinic.
        </div>
      ) : (
        doctors.map((doc) => {
          const isSelected = selectedDoctorId === doc.id;
          return (
            <Button
              key={doc.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="xs"
              onClick={() => onSelectDoctor(doc.id)}
              className={`rounded-none border text-xs font-mono text-left justify-start p-2 h-auto flex flex-col items-start ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-primary bg-background text-foreground hover:bg-card"
              }`}
            >
              <span className="font-bold text-[11px]">{doc.name}</span>
              {doc.room && (
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-primary-foreground/80" : "text-text-muted"
                  }`}
                >
                  {doc.room}
                </span>
              )}
            </Button>
          );
        })
      )}
    </div>
  );
}
