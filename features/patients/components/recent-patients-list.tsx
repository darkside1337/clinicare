import React from "react";
import Link from "next/link";
import { calculateAge } from "@/lib/dates/calculate-age";

export interface RecentPatientItem {
  id: string;
  name: string;
  dob: string;
  phone: string | null;
  hasSevereAllergy?: boolean;
}

interface RecentPatientsListProps {
  patients: RecentPatientItem[];
  role?: "doctor" | "receptionist";
}

export function RecentPatientsList({
  patients,
  role = "doctor",
}: RecentPatientsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-primary pb-1">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
          Recent Patients
        </h2>
        <span className="text-[11px] font-mono text-text-muted">
          DIRECTORY CENSUS
        </span>
      </div>

      <div className="border border-primary divide-y divide-neutral-border bg-card">
        {patients.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-text-muted">
            No patients registered yet.
          </div>
        ) : (
          patients.map((rp) => (
            <Link
              key={rp.id}
              href={`/patients/${rp.id}`}
              className="p-3 block hover:bg-muted transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground group-hover:underline">
                  {rp.name}
                </span>
                <span className="text-[11px] font-mono text-text-muted tabular-nums">
                  {rp.phone || "No phone"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mt-1">
                <span className="tabular-nums">
                  DOB: {rp.dob} • {calculateAge(rp.dob) ?? 0}y
                </span>
                {role === "doctor" && rp.hasSevereAllergy && (
                  <span
                    aria-label="Severe allergy recorded"
                    className="text-clinical-critical font-bold uppercase text-[10px]"
                  >
                    Allergy Flag
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
