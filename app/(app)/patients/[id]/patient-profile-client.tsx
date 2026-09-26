"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Pill,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PatientRecord } from "@/features/patients/types";
import { AllergyList } from "@/features/patients/components/allergy-list";
import { ProblemList } from "@/features/patients/components/problem-list";
import dynamic from "next/dynamic";

const ConsultationTimeline = dynamic(
  () =>
    import("@/features/consultations/components/consultation-timeline").then(
      (m) => m.ConsultationTimeline
    ),
  {
    loading: () => (
      <div className="border border-[#141618] bg-white p-6 font-mono text-xs text-[#5A5D61]">
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
        createdAt: new Date(),
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
        createdAt: new Date(),
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
    <div className="min-h-full bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Patient Profile Action Bar */}
      <div className="border-b border-[#141618] bg-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center border border-[#141618] bg-[#FAFAF7] font-mono text-xs font-bold uppercase text-[#141618]">
            {patient.sex?.charAt(0) || "P"}
          </div>
          <div>
            <h1 className="text-base font-bold uppercase tracking-tight text-[#141618]">
              {patient.name}
            </h1>
            <p className="text-[11px] font-mono text-[#5A5D61]">
              DOB: {patient.dob} • RECORD REF: {patient.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {canStartConsultation && (
          <Button
            asChild
            className="min-h-[32px] rounded-none border border-[#141618] bg-[#141618] px-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAFAF7] transition-colors hover:bg-black"
          >
            <Link href={`/patients/${patient.id}/consultations/new`}>
              <Plus className="size-3.5 stroke-[2.5] mr-1.5" />
              <span>Start Consultation</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Main Two-Column Document Canvas */}
      <main className="mx-auto flex w-full max-w-[1536px] flex-col lg:flex-row">
        {/* LEFT COLUMN: Persistent Summary (30% width on desktop, sticky) */}
        <aside className="w-full shrink-0 border-b border-[#141618] lg:w-[32%] lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-3rem)]">
          <div className="p-6 lg:p-7 sticky top-12 space-y-7">
            {/* Patient Identity Document Block */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-[#141618] pb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#5A5D61]">
                  RECORD #{patient.id.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-[#5A5D61]">
                  REG: {patient.registeredDate}
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#141618]">
                  {patient.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs font-mono text-[#5A5D61]">
                  <span>
                    DOB: {patient.dob} ({patient.age}y)
                  </span>
                  <span>•</span>
                  <span>{patient.sex}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-xs text-[#5A5D61]">
                <div className="flex justify-between">
                  <span className="font-mono text-[11px] uppercase">Telephone</span>
                  <span className="font-mono text-[#141618]">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] uppercase">Email</span>
                    <span className="font-mono text-[#141618]">{patient.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-mono text-[11px] uppercase">Address</span>
                  <span className="text-right text-[#141618]">{patient.address}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#D8D4CC]">
                  <span className="font-mono text-[11px] uppercase">Emergency</span>
                  <span className="text-[#141618]">
                    {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                  </span>
                </div>
              </div>
            </section>

            {/* ALLERGIES & PROBLEMS: Doctor only per PRD §6 */}
            {role === "doctor" ? (
              <>
                <AllergyList initialAllergies={allergies} />
                <ProblemList initialProblems={problems} />
              </>
            ) : (
              <div className="border border-[#141618] bg-white p-4 shadow-[1px_1px_0px_#141618] space-y-2">
                <div className="flex items-center justify-between border-b border-[#141618] pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A5D61]">
                    Clinical Medical History
                  </span>
                  <Badge variant="outline" className="font-mono text-[9px] uppercase">
                    Restricted
                  </Badge>
                </div>
                <p className="text-[11px] font-mono text-[#5A5D61]">
                  Allergies, chronic conditions, and diagnostic records are restricted to attending clinicians.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Work Canvas (70% width on desktop) */}
        <section className="flex-1 p-6 lg:p-8 space-y-8">
          {role === "doctor" ? (
            <>
              {/* SECTION A: Above-the-fold Quick Clinical Status Strip (PRD §8.4 / §12) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Upcoming Appointments */}
                <div className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#141618] pb-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-[#141618]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#141618]">
                        Appointments
                      </h3>
                    </div>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {upcomingAppointments.length} UPCOMING
                    </Badge>
                  </div>

                  {upcomingAppointments.length === 0 ? (
                    <div className="border border-dashed border-[#D8D4CC] p-4 text-center text-xs font-mono text-[#5A5D61]">
                      No upcoming appointments scheduled
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {upcomingAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="border border-[#D8D4CC] bg-[#FAFAF7] p-2.5 space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-[#141618]">
                              {apt.scheduledAt}
                            </span>
                            <Badge
                              variant={apt.status === "checked-in" ? "amber" : "outline"}
                              className="font-mono text-[10px] uppercase"
                            >
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#5A5D61]">
                            Clinician: <strong className="text-[#141618]">{apt.doctorName}</strong>
                          </div>
                          {apt.reason && (
                            <div className="text-[11px] text-[#141618] font-medium">
                              {apt.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Active Medications (Derived from Prescriptions) */}
                <div className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#141618] pb-1.5">
                    <div className="flex items-center gap-2">
                      <Pill className="size-4 text-[#141618]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#141618]">
                        Active Medications
                      </h3>
                    </div>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {activeMedications.length} ACTIVE
                    </Badge>
                  </div>

                  {activeMedications.length === 0 ? (
                    <div className="border border-dashed border-[#D8D4CC] p-4 text-center text-xs font-mono text-[#5A5D61]">
                      No active prescribed medications recorded
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {activeMedications.map((item, idx) => (
                        <div
                          key={idx}
                          className="border border-[#D8D4CC] bg-[#FAFAF7] p-2.5 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#141618]">{item.medication}</span>
                            <span className="font-mono text-[11px] text-[#5A5D61]">{item.dosage}</span>
                          </div>
                          <div className="text-[11px] text-[#5A5D61] font-mono">
                            {item.frequency} • {item.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION B: Consultation Timeline (Reverse Chronological) */}
              <ConsultationTimeline
                consultations={consultations}
                patientId={patient.id}
              />
            </>
          ) : (
            /* RECEPTIONIST VIEW: Front-Desk Patient Administration */
            <div className="space-y-6">
              <div className="border border-[#141618] bg-white p-6 shadow-[1px_1px_0px_#141618] space-y-4">
                <div className="flex items-center justify-between border-b border-[#141618] pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-[#141618]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#141618]">
                      Patient Appointments &amp; Bookings
                    </h2>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {upcomingAppointments.length} ACTIVE
                  </Badge>
                </div>

                {upcomingAppointments.length === 0 ? (
                  <div className="border border-dashed border-[#D8D4CC] p-6 text-center text-xs font-mono text-[#5A5D61]">
                    No upcoming appointments scheduled for this patient.
                  </div>
                ) : (
                  <div className="divide-y divide-[#D8D4CC] border border-[#D8D4CC]">
                    {upcomingAppointments.map((apt) => (
                      <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAF7]">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#141618] text-sm">
                              {apt.scheduledAt}
                            </span>
                            <Badge
                              variant={apt.status === "checked-in" ? "amber" : "outline"}
                              className="font-mono text-[10px] uppercase"
                            >
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#5A5D61]">
                            Practitioner: <strong className="text-[#141618]">{apt.doctorName}</strong>
                          </div>
                          {apt.reason && (
                            <div className="text-xs text-[#141618]">
                              Reason: {apt.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-dashed border-[#D8D4CC] bg-[#FAFAF7] p-5 text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[#141618]">
                  Front-Desk Administration View
                </p>
                <p className="text-[11px] font-mono text-[#5A5D61]">
                  Clinical encounter notes, consultations, and prescriptions are restricted to medical practitioners.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
