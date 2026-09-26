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
import { PatientRecord } from "@/lib/mock-patient";
import { AllergyList } from "@/features/patients/components/allergy-list";
import { ProblemList } from "@/features/patients/components/problem-list";
import { ConsultationTimeline } from "@/features/consultations/components/consultation-timeline";

interface PatientProfileClientProps {
  initialData: PatientRecord;
}

export function PatientProfileClient({ initialData }: PatientProfileClientProps) {
  const { patient, allergies, problems, consultations, appointments, prescriptions } = initialData;

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.status === "scheduled" || a.status === "checked-in"
    );
  }, [appointments]);

  const activeMedications = useMemo(() => {
    return prescriptions.flatMap((rx) => rx.items);
  }, [prescriptions]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Top Clinical Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono tracking-tight">
          <Link
            href="/patients"
            className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#141618] hover:opacity-75 transition-opacity"
          >
            <span>CLINICARE</span>
            <span className="text-[11px] text-[#5A5D61] hidden sm:inline">
              / PATIENT RECORD
            </span>
          </Link>
          <span className="text-[#D8D4CC] hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#5A5D61] uppercase tracking-wider text-[11px]">
              PT:
            </span>
            <span className="font-semibold text-[#141618] text-xs sm:text-sm">
              {patient.name}
            </span>
            <span className="text-[#5A5D61] text-[11px]">({patient.id})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("clinicare:open-search"))
            }
            className="hidden md:flex items-center gap-1.5 rounded-none border border-[#141618] bg-white px-2.5 py-1 text-xs font-mono text-[#5A5D61] hover:bg-[#FAFAF7] hover:text-[#141618] h-auto"
          >
            <Search className="size-3.5 text-[#141618]" />
            <span>Search (Cmd+K)</span>
          </Button>

          <Button
            asChild
            className="min-h-[38px] rounded-none border border-[#141618] bg-[#141618] px-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAFAF7] transition-colors hover:bg-black"
          >
            <Link href={`/patients/${patient.id}/consultations/new`}>
              <Plus className="size-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline sm:inline">Start Consultation</span>
              <span className="xs:hidden sm:hidden inline">Consult</span>
            </Link>
          </Button>
        </div>
      </header>

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

            {/* ALLERGIES: High-priority clinical flags (PRD §8.4: Always visible) */}
            <AllergyList initialAllergies={allergies} />

            {/* PROBLEM LIST: Pre-existing medical conditions (PRD §8.4) */}
            <ProblemList initialProblems={problems} />
          </div>
        </aside>

        {/* RIGHT COLUMN: Clinical Work Canvas (70% width on desktop) */}
        <section className="flex-1 p-6 lg:p-8 space-y-8">
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
        </section>
      </main>
    </div>
  );
}
