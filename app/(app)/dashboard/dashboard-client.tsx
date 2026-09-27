"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Plus, User } from "lucide-react";
import { AppointmentQueue } from "@/features/appointments/components/appointment-queue";
import { DashboardQuickActions } from "@/features/appointments/components/dashboard-quick-actions";
import { ClinicCensusStrip } from "@/features/appointments/components/clinic-census-strip";
import {
  RecentPatientsList,
  type RecentPatientItem,
} from "@/features/patients/components/recent-patients-list";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { FormPatient } from "@/features/appointments/components/appointment-form";
import { useOptimisticAppointments } from "@/features/appointments/hooks/use-optimistic-appointments";

interface DashboardClientProps {
  initialAppointments: AppointmentDetails[];
  recentPatients?: RecentPatientItem[];
  role?: "doctor" | "receptionist";
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
  patients?: FormPatient[];
}

export function DashboardClient({
  initialAppointments,
  recentPatients = [],
  role: roleProp,
  sessionRole,
  patients = [],
}: DashboardClientProps) {
  const role = sessionRole || roleProp || "doctor";
  const { appointments, updateStatus } = useOptimisticAppointments({
    initialAppointments,
  });

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
            onStatusChange={updateStatus}
            role={role}
          />
        </section>

        {/* RIGHT COLUMN: Census Metrics & Recent Patients Strip */}
        <aside className="w-full shrink-0 lg:w-[32%] p-4 sm:p-6 lg:p-7 space-y-7">
          {/* Quick Metrics Block */}
          <ClinicCensusStrip
            waitingCount={waitingCount}
            totalBooked={totalBooked}
            completedCount={completedCount}
            noShowCount={noShowCount}
          />

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
          <RecentPatientsList patients={recentPatients} role={role} />
        </aside>
      </div>
    </div>
  );
}
