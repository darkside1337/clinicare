"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PatientRecord } from "@/features/patients/types";
import { AllergyList } from "@/features/patients/components/allergy-list";
import { ProblemList } from "@/features/patients/components/problem-list";
import { PatientIdentityCard } from "@/features/patients/components/patient-identity-card";
import { UpcomingAppointmentsCard } from "@/features/patients/components/upcoming-appointments-card";
import { ActiveMedicationsCard } from "@/features/patients/components/active-medications-card";
import dynamic from "next/dynamic";

const ConsultationTimeline = dynamic(
  () =>
    import("@/features/consultations/components/consultation-timeline").then(
      (m) => m.ConsultationTimeline
    ),
  {
    loading: () => (
      <div className="border border-primary bg-card p-6 font-mono text-xs text-muted-foreground">
        Loading consultations...
      </div>
    ),
  }
);

interface PatientProfileClientProps {
  initialData: PatientRecord;
  canStartConsultation: boolean;
  role?: "doctor" | "receptionist";
}

export function PatientProfileClient({
  initialData,
  canStartConsultation,
  role = "doctor",
}: PatientProfileClientProps) {
  const {
    patient,
    allergies: propAllergies,
    problems: propProblems,
    consultations,
    appointments,
    prescriptions,
  } = initialData;

  const allergies = useMemo(
    () =>
      propAllergies.map((a) => ({
        id: a.id,
        patientId: patient.id,
        substance: a.substance,
        severity: a.severity,
        reaction: a.reaction ?? null,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      })),
    [propAllergies, patient.id]
  );

  const problems = useMemo(
    () =>
      propProblems.map((p) => ({
        id: p.id,
        patientId: patient.id,
        condition: p.condition,
        status: p.status,
        onsetDate: p.onsetDate ?? null,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      })),
    [propProblems, patient.id]
  );

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.status === "scheduled" || a.status === "checked-in"
    );
  }, [appointments]);

  const activeMedications = useMemo(() => {
    return prescriptions.flatMap((rx) => rx.items);
  }, [prescriptions]);

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Patient Profile Action Bar */}
      <div className="border-b border-primary bg-card px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center border border-primary bg-background font-mono text-xs font-bold uppercase text-foreground">
            {patient.sex?.charAt(0) || "P"}
          </div>
          <div>
            <h1 className="text-base font-bold uppercase tracking-tight text-foreground">
              {patient.name}
            </h1>
            <p className="text-[11px] font-mono text-text-muted">
              DOB: {patient.dob} • RECORD REF: {patient.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {canStartConsultation && (
          <Button
            asChild
            className="min-h-[32px] rounded-none border border-primary bg-primary px-3.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-black"
          >
            <Link href={`/patients/${patient.id}/consultations/new`}>
              <Plus className="size-3.5 stroke-[2.5] mr-1.5" />
              <span>Start Consultation</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Main Two-Column Document Canvas */}
      <div className="mx-auto flex w-full max-w-[1536px] flex-col lg:flex-row">
        {/* LEFT COLUMN: Persistent Summary (32% width on desktop, sticky on lg) */}
        <aside className="w-full shrink-0 border-b border-primary lg:w-[32%] lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-3rem)]">
          <div className="p-6 lg:p-7 lg:sticky lg:top-12 space-y-7">
            <PatientIdentityCard patient={patient} />

            {/* ALLERGIES & PROBLEMS: Doctor only per PRD §6 */}
            {role === "doctor" ? (
              <>
                <AllergyList initialAllergies={allergies} patientId={patient.id} />
                <ProblemList initialProblems={problems} patientId={patient.id} />
              </>
            ) : (
              <div className="border border-primary bg-card p-4 shadow-[1px_1px_0px_var(--color-primary)] space-y-2">
                <div className="flex items-center justify-between border-b border-primary pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    Clinical Medical History
                  </span>
                  <Badge variant="outline" className="font-mono text-[9px] uppercase">
                    Restricted
                  </Badge>
                </div>
                <p className="text-[11px] font-mono text-text-muted">
                  Allergies, chronic conditions, and diagnostic records are restricted to attending clinicians.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Work Canvas (68% width on desktop) */}
        <section className="flex-1 p-6 lg:p-8 space-y-8">
          {role === "doctor" ? (
            <>
              {/* Above-the-fold Quick Clinical Status Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UpcomingAppointmentsCard appointments={upcomingAppointments} />
                <ActiveMedicationsCard medications={activeMedications} />
              </div>

              {/* Consultation Timeline (Reverse Chronological) */}
              <ConsultationTimeline
                consultations={consultations}
                patientId={patient.id}
              />
            </>
          ) : (
            /* RECEPTIONIST VIEW: Front-Desk Patient Administration */
            <div className="space-y-6">
              <UpcomingAppointmentsCard
                appointments={upcomingAppointments}
                isReceptionistView={true}
              />

              <div className="border border-dashed border-neutral-border bg-background p-5 text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Front-Desk Administration View
                </p>
                <p className="text-[11px] font-mono text-text-muted">
                  Clinical encounter notes, consultations, and prescriptions are restricted to medical practitioners.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
