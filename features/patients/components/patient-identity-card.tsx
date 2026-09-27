import React from "react";
import type { PatientProfileData } from "@/features/patients/types";

interface PatientIdentityCardProps {
  patient: PatientProfileData;
}

export function PatientIdentityCard({ patient }: PatientIdentityCardProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-primary pb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">
          RECORD #{patient.id.toUpperCase()}
        </span>
        <span className="text-[11px] font-mono text-text-muted">
          REG: {patient.registeredDate}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {patient.name}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs font-mono text-text-muted">
          <span>
            DOB: {patient.dob} ({patient.age}y)
          </span>
          <span>•</span>
          <span>{patient.sex}</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-1 text-xs text-text-muted">
        <div className="flex justify-between">
          <span className="font-mono text-[11px] uppercase">Telephone</span>
          <span className="font-mono text-foreground">{patient.phone}</span>
        </div>
        {patient.email && (
          <div className="flex justify-between">
            <span className="font-mono text-[11px] uppercase">Email</span>
            <span className="font-mono text-foreground">{patient.email}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-mono text-[11px] uppercase">Address</span>
          <span className="text-right text-foreground">{patient.address}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-neutral-border">
          <span className="font-mono text-[11px] uppercase">Emergency</span>
          <span className="text-foreground">
            {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
          </span>
        </div>
      </div>
    </section>
  );
}
