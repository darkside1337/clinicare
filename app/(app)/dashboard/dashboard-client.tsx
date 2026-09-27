"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, User } from "lucide-react";
import { AppointmentQueue } from "@/features/appointments/components/appointment-queue";
import { DashboardQuickActions } from "@/features/appointments/components/dashboard-quick-actions";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { AppointmentStatus } from "@/features/appointments/schema";
import type { FormPatient } from "@/features/appointments/components/appointment-form";

interface RecentPatientItem {
  id: string;
  name: string;
  dob: string;
  phone: string | null;
  hasSevereAllergy?: boolean;
}

interface DashboardClientProps {
  initialAppointments: AppointmentDetails[];
  recentPatients?: RecentPatientItem[];
  role?: "doctor" | "receptionist";
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
  patients?: FormPatient[];
}

import { calculateAge as calcAge } from "@/lib/dates/calculate-age";

function calculateAge(dob: string): number {
  return calcAge(dob) ?? 0;
}

export function DashboardClient({
  initialAppointments,
  recentPatients = [],
  role: roleProp,
  sessionRole,
  patients = [],
}: DashboardClientProps) {
  const role = sessionRole || roleProp || "doctor";
  const [appointments, setAppointments] = useState<AppointmentDetails[]>(initialAppointments);
  const [prevInitial, setPrevInitial] = useState(initialAppointments);

  if (initialAppointments !== prevInitial) {
    setPrevInitial(initialAppointments);
    setAppointments(initialAppointments);
  }

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const totalBooked = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === "checked-in").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const noShowCount = appointments.filter((a) => a.status === "no-show").length;

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Dashboard Sub-Header with Quick Actions */}
      <div className="border-b border-primary bg-card px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold uppercase tracking-tight text-foreground">
            Practice Dashboard
          </h1>
          <p className="text-[11px] font-mono text-text-muted">
            Daily Appointment Queue &amp; Clinic Census
          </p>
        </div>
        <DashboardQuickActions role={role} patients={patients} />
      </div>

      {/* Main Two-Column Dashboard Workspace */}
      <div className="mx-auto flex w-full max-w-[1536px] flex-col lg:flex-row">
        {/* LEFT COLUMN: Today's Appointment Queue */}
        <section className="flex-1 border-b border-primary p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
          <AppointmentQueue
            appointments={appointments}
            onStatusChange={handleStatusChange}
            role={role}
          />
        </section>

        {/* RIGHT COLUMN: Census Metrics & Recent Patients Strip */}
        <aside className="w-full shrink-0 lg:w-[32%] p-4 sm:p-6 lg:p-7 space-y-7">
          {/* Quick Metrics Block */}
          <div className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-4">
            <div className="flex items-center justify-between border-b border-primary pb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">
                CLINIC CENSUS
              </span>
              <span className="text-[11px] font-mono text-clinical-resolved font-bold">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-neutral-border bg-background p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Waiting Now
                </span>
                <span className="text-2xl font-bold font-mono text-clinical-warning mt-0.5 block tabular-nums">
                  {waitingCount}
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Checked-in
                </span>
              </div>

              <div className="border border-neutral-border bg-background p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Total Booked
                </span>
                <span className="text-2xl font-bold font-mono text-foreground mt-0.5 block tabular-nums">
                  {totalBooked}
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  All practitioners
                </span>
              </div>

              <div className="border border-neutral-border bg-background p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Completed
                </span>
                <span className="text-2xl font-bold font-mono text-clinical-resolved mt-0.5 block tabular-nums">
                  {completedCount}
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Encounters done
                </span>
              </div>

              <div className="border border-neutral-border bg-background p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  No-Show
                </span>
                <span className="text-2xl font-bold font-mono text-clinical-critical mt-0.5 block tabular-nums">
                  {noShowCount}
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Missed visits
                </span>
              </div>
            </div>
          </div>

          {/* Quick-Action Practice Shortcuts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-primary pb-1">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Practice Actions
              </h2>
              <span className="text-[11px] font-mono text-text-muted">
                SHORTCUTS
              </span>
            </div>

            <div className="space-y-2">
              <Link
                href="/patients"
                className="flex items-center justify-between border border-primary bg-card p-3 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="size-4 text-foreground" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-foreground block">
                      Patient Directory
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Search and browse registered patients
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-foreground" />
              </Link>

              <Link
                href="/patients/new"
                className="flex items-center justify-between border border-primary bg-card p-3 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="size-4 text-foreground" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-foreground block">
                      New Patient Registration
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Register intake demographics and medical history
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-foreground" />
              </Link>
            </div>
          </div>

          {/* Recent Patients */}
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
              {recentPatients.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-text-muted">
                  No patients registered yet.
                </div>
              ) : (
                recentPatients.map((rp) => (
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
                        DOB: {rp.dob} • {calculateAge(rp.dob)}y
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
        </aside>
      </div>
    </div>
  );
}
