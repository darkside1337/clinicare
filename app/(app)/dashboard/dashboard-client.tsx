"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User, Plus, ArrowRight } from "lucide-react";
import {
  DashboardAppointment,
  MOCK_TODAY_APPOINTMENTS,
  MOCK_RECENT_PATIENTS,
} from "@/lib/mock-dashboard";
import { DashboardQuickActions } from "@/features/appointments/components/dashboard-quick-actions";
import {
  AppointmentQueue,
  StatusType,
} from "@/features/appointments/components/appointment-queue";


interface DashboardClientProps {
  initialAppointments?: DashboardAppointment[];
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
}

export function DashboardClient({
  initialAppointments = MOCK_TODAY_APPOINTMENTS,
  sessionRole,
  sessionUserName,
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const paramRole = searchParams?.get("role") as "doctor" | "receptionist" | null;
  const role = paramRole || sessionRole || "doctor";

  const [appointments, setAppointments] = useState<DashboardAppointment[]>(initialAppointments);

  const handleStatusChange = (id: string, newStatus: StatusType) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const totalBooked = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === "checked-in").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const noShowCount = appointments.filter((a) => a.status === "no-show").length;

  return (
    <div className="min-h-full bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Dashboard Sub-Header with Quick Actions */}
      <div className="border-b border-[#141618] bg-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold uppercase tracking-tight text-[#141618]">
            Practice Dashboard
          </h1>
          <p className="text-[11px] font-mono text-[#5A5D61]">
            Daily Appointment Queue & Clinic Census
          </p>
        </div>
        <DashboardQuickActions role={role} />
      </div>

      {/* Main Two-Column Dashboard Workspace */}
      <main className="mx-auto flex w-full max-w-[1536px] flex-col lg:flex-row">
        {/* LEFT COLUMN: Today's Appointment Queue */}
        <section className="flex-1 border-b border-[#141618] p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
          <AppointmentQueue
            appointments={appointments}
            onStatusChange={handleStatusChange}
            role={role}
          />
        </section>

        {/* RIGHT COLUMN: Census Metrics & Recent Patients Strip */}
        <aside className="w-full shrink-0 lg:w-[32%] p-4 sm:p-6 lg:p-7 space-y-7">
          {/* Quick Metrics Block */}
          <div className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-4">
            <div className="flex items-center justify-between border-b border-[#141618] pb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#5A5D61]">
                CLINIC CENSUS
              </span>
              <span className="text-[11px] font-mono text-[#166534] font-bold">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#D8D4CC] bg-[#FAFAF7] p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  Waiting Now
                </span>
                <span className="text-2xl font-bold font-mono text-[#D97706] mt-0.5 block">
                  {waitingCount}
                </span>
                <span className="text-[11px] font-mono text-[#5A5D61]">
                  Checked-in
                </span>
              </div>

              <div className="border border-[#D8D4CC] bg-[#FAFAF7] p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  Total Booked
                </span>
                <span className="text-2xl font-bold font-mono text-[#141618] mt-0.5 block">
                  {totalBooked}
                </span>
                <span className="text-[11px] font-mono text-[#5A5D61]">
                  All practitioners
                </span>
              </div>

              <div className="border border-[#D8D4CC] bg-[#FAFAF7] p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  Completed
                </span>
                <span className="text-2xl font-bold font-mono text-[#166534] mt-0.5 block">
                  {completedCount}
                </span>
                <span className="text-[11px] font-mono text-[#5A5D61]">
                  Encounters done
                </span>
              </div>

              <div className="border border-[#D8D4CC] bg-[#FAFAF7] p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  No-Show
                </span>
                <span className="text-2xl font-bold font-mono text-[#B91C1C] mt-0.5 block">
                  {noShowCount}
                </span>
                <span className="text-[11px] font-mono text-[#5A5D61]">
                  Missed visits
                </span>
              </div>
            </div>
          </div>

          {/* Quick-Action Practice Shortcuts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#141618] pb-1">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#141618]">
                Practice Actions
              </h2>
              <span className="text-[11px] font-mono text-[#5A5D61]">
                SHORTCUTS
              </span>
            </div>

            <div className="space-y-2">
              <Link
                href="/patients"
                className="flex items-center justify-between border border-[#141618] bg-white p-3 hover:bg-[#FAFAF7] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="size-4 text-[#141618]" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-[#141618] block">
                      Patient Directory
                    </span>
                    <span className="text-[11px] text-[#5A5D61]">
                      Search and browse registered patients
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-[#141618]" />
              </Link>

              <Link
                href="/patients/new"
                className="flex items-center justify-between border border-[#141618] bg-white p-3 hover:bg-[#FAFAF7] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="size-4 text-[#141618]" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-[#141618] block">
                      New Patient Registration
                    </span>
                    <span className="text-[11px] text-[#5A5D61]">
                      Register intake demographics and medical history
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-[#141618]" />
              </Link>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#141618] pb-1">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#141618]">
                Recent Patients
              </h2>
              <span className="text-[11px] font-mono text-[#5A5D61]">
                LAST ACCESSED
              </span>
            </div>

            <div className="border border-[#141618] divide-y divide-[#D8D4CC] bg-white">
              {MOCK_RECENT_PATIENTS.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/patients/${rp.id}`}
                  className="p-3 block hover:bg-[#FAFAF7] transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#141618] group-hover:underline">
                      {rp.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#5A5D61]">
                      {rp.lastSeen}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#5A5D61] mt-1">
                    <span>
                      ID: {rp.id} • {rp.age}y
                    </span>
                    {rp.hasSevereAllergy && (
                      <span className="text-[#B91C1C] font-bold uppercase text-[10px]">
                        Allergy Flag
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
