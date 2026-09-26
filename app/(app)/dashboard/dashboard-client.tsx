"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Plus, ArrowRight } from "lucide-react";
import { DashboardQuickActions } from "@/features/appointments/components/dashboard-quick-actions";
import {
  AppointmentQueue,
  StatusType,
} from "@/features/appointments/components/appointment-queue";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { PatientDirectoryItem } from "@/features/patients/queries";
import type { FormPatient } from "@/features/appointments/components/appointment-form";

interface DashboardClientProps {
  initialAppointments?: AppointmentDetails[];
  recentPatients?: PatientDirectoryItem[];
  patients?: FormPatient[];
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
}

function calculateAge(dobStr?: string): number {
  if (!dobStr) return 0;
  const parts = dobStr.includes("/") ? dobStr.split("/") : dobStr.split("-");
  let birthDate: Date;
  if (dobStr.includes("/")) {
    birthDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  } else {
    birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

export function DashboardClient({
  initialAppointments = [],
  recentPatients = [],
  patients = [],
  sessionRole = "doctor",
}: DashboardClientProps) {
  // Server-resolved role is the only source of truth — never trust URL params.
  const role = sessionRole;

  const [appointments, setAppointments] = useState<AppointmentDetails[]>(initialAppointments);

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
        <DashboardQuickActions role={role} patients={patients} />
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
                DIRECTORY CENSUS
              </span>
            </div>

            <div className="border border-[#141618] divide-y divide-[#D8D4CC] bg-white">
              {recentPatients.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-[#5A5D61]">
                  No patients registered yet.
                </div>
              ) : (
                recentPatients.map((rp) => (
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
                        {rp.phone || "No phone"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#5A5D61] mt-1">
                      <span>
                        DOB: {rp.dob} • {calculateAge(rp.dob)}y
                      </span>
                      {rp.hasSevereAllergy && (
                        <span className="text-[#B91C1C] font-bold uppercase text-[10px]">
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
      </main>
    </div>
  );
}
