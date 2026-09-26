"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  AlertTriangle,
  ChevronDown,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { AppointmentStatus } from "@/features/appointments/schema";
import { updateAppointmentStatusAction } from "@/app/(app)/appointments/actions";

export type StatusType = AppointmentStatus;

export const DASHBOARD_STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    badgeVariant: "amber" | "outline" | "green" | "destructive" | "muted";
    rowBg: string;
  }
> = {
  "checked-in": {
    label: "Waiting in Clinic",
    badgeVariant: "amber",
    rowBg: "bg-[#FFFDF5]/40",
  },
  scheduled: {
    label: "Scheduled",
    badgeVariant: "outline",
    rowBg: "bg-white",
  },
  completed: {
    label: "Completed",
    badgeVariant: "green",
    rowBg: "bg-[#FAFAF7]/50",
  },
  "no-show": {
    label: "No-Show",
    badgeVariant: "destructive",
    rowBg: "bg-white",
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "muted",
    rowBg: "bg-[#FAFAF7]/50",
  },
};

interface QueueDoctor {
  id: string;
  name: string;
}

interface AppointmentQueueProps {
  appointments: AppointmentDetails[];
  doctors?: QueueDoctor[];
  onStatusChange?: (id: string, newStatus: AppointmentStatus) => void;
  role?: "doctor" | "receptionist";
}

interface NormalizedQueueAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number | null;
  patientDob: string;
  doctorName: string;
  timeSlot: string;
  status: AppointmentStatus;
  isWalkIn: boolean;
  allergyFlag: boolean;
  reason: string;
}

function calculateAge(dobStr?: string): number | null {
  if (!dobStr) return null;
  const parts = dobStr.includes("/") ? dobStr.split("/") : dobStr.split("-");
  let birthDate: Date;
  if (dobStr.includes("/")) {
    birthDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  } else {
    birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function normalizeQueueItem(apt: AppointmentDetails): NormalizedQueueAppointment {
  const d = new Date(apt.scheduledAt);
  const timeSlot = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return {
    id: apt.id,
    patientId: apt.patientId,
    patientName: apt.patient.name,
    patientAge: calculateAge(apt.patient.dob),
    patientDob: apt.patient.dob,
    doctorName: apt.doctor.name,
    timeSlot,
    status: apt.status as AppointmentStatus,
    isWalkIn: apt.isWalkIn,
    allergyFlag: !!apt.patient.hasSevereAllergy,
    reason: apt.reason || "General Consultation",
  };
}

export function AppointmentQueue({
  appointments,
  doctors,
  onStatusChange,
  role = "doctor",
}: AppointmentQueueProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("All Clinicians");
  const [doctorMenuOpen, setDoctorMenuOpen] = useState(false);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);

  const normalized = appointments.map(normalizeQueueItem);

  const doctorOptions = React.useMemo(() => {
    if (doctors && doctors.length > 0) {
      return ["All Clinicians", ...doctors.map((d) => d.name)];
    }
    const fromAppointments = Array.from(new Set(normalized.map((a) => a.doctorName).filter(Boolean)));
    return fromAppointments.length > 0 ? ["All Clinicians", ...fromAppointments] : ["All Clinicians"];
  }, [doctors, normalized]);

  const filteredAppointments = normalized.filter((apt) => {
    if (selectedDoctor === "All Clinicians") return true;
    return apt.doctorName === selectedDoctor;
  });

  const handleStatusSelect = async (id: string, newStatus: AppointmentStatus) => {
    onStatusChange?.(id, newStatus);
    setStatusMenuOpenId(null);
    try {
      await updateAppointmentStatusAction(id, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleToggleCheckIn = async (id: string, currentStatus: AppointmentStatus) => {
    const nextStatus: AppointmentStatus = currentStatus === "checked-in" ? "scheduled" : "checked-in";
    await handleStatusSelect(id, nextStatus);
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Practitioner Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141618] pb-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[#141618]" />
            <h1 className="text-base font-bold uppercase tracking-wider text-[#141618]">
              Today&apos;s Clinic Appointments
            </h1>
          </div>
          <p className="text-xs text-[#5A5D61] mt-0.5">
            Real-time patient check-in status and daily encounter queue.
          </p>
        </div>

        {/* Doctor Clinician Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5A5D61] uppercase tracking-wider">
            Filter Clinician:
          </span>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDoctorMenuOpen(!doctorMenuOpen)}
              className="rounded-none border-[#141618] bg-white px-3 py-1.5 text-xs font-medium text-[#141618] hover:bg-[#FAFAF7] flex items-center justify-between gap-2 min-w-[170px]"
            >
              <span className="truncate">{selectedDoctor}</span>
              <ChevronDown className="size-3.5 text-[#141618] shrink-0" />
            </Button>

            {doctorMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-40 w-56 border border-[#141618] bg-white p-1 shadow-[2px_2px_0px_#141618]">
                {doctorOptions.map((doc) => (
                  <Button
                    key={doc}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setDoctorMenuOpen(false);
                    }}
                    className={`w-full justify-start rounded-none px-2.5 py-1.5 text-xs text-left h-auto font-mono ${
                      selectedDoctor === doc
                        ? "bg-[#141618] text-[#FAFAF7] hover:bg-black hover:text-[#FAFAF7]"
                        : "text-[#141618] hover:bg-[#FAFAF7]"
                    }`}
                  >
                    {doc}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Queue Table / List */}
      {filteredAppointments.length === 0 ? (
        <div className="border border-dashed border-[#D8D4CC] p-12 text-center">
          <Calendar className="mx-auto size-8 text-[#5A5D61] mb-2" />
          <p className="text-sm font-semibold text-[#141618]">
            No appointments scheduled
          </p>
          <p className="text-xs text-[#5A5D61] mt-1">
            There are no scheduled visits matching the selected practitioner today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => {
            const config = DASHBOARD_STATUS_CONFIG[apt.status] || DASHBOARD_STATUS_CONFIG.scheduled;
            const isWaiting = apt.status === "checked-in";

            return (
              <article
                key={apt.id}
                className={`border border-[#141618] ${config.rowBg} p-4 shadow-[1px_1px_0px_#141618] transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D4CC] pb-3">
                  {/* Time slot & Patient Identity */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[#141618] bg-white border border-[#141618] px-2 py-0.5 shrink-0">
                      <Clock className="size-3.5 text-[#5A5D61]" />
                      <span>{apt.timeSlot}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/patients/${apt.patientId}`}
                          className="text-sm font-bold text-[#141618] hover:underline"
                        >
                          {apt.patientName}
                        </Link>
                        <span className="text-xs font-mono text-[#5A5D61]">
                          ({apt.patientAge !== null ? `${apt.patientAge}y • ` : ""}DOB: {apt.patientDob})
                        </span>
                        {apt.isWalkIn && (
                          <Badge className="border-[#141618] bg-[#141618] text-[#FAFAF7]">
                            Walk-In
                          </Badge>
                        )}
                        {apt.allergyFlag && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 font-mono text-[10px]"
                          >
                            <AlertTriangle className="size-3" />
                            <span>Allergy</span>
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-[#5A5D61] mt-0.5 block">
                        Assigned Clinician:{" "}
                        <strong className="text-[#141618]">
                          {apt.doctorName}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Interactive Status Switcher Popover */}
                  <div className="relative shrink-0 flex items-center gap-2">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setStatusMenuOpenId(
                            statusMenuOpenId === apt.id ? null : apt.id
                          )
                        }
                        className="h-auto rounded-none border p-0 hover:bg-transparent"
                      >
                        <Badge
                          variant={config.badgeVariant}
                          className="flex items-center gap-1.5 px-2.5 py-1 cursor-pointer"
                        >
                          <span>{config.label}</span>
                          <ChevronDown className="size-3" />
                        </Badge>
                      </Button>

                      {/* Dropdown status menu */}
                      {statusMenuOpenId === apt.id && (
                        <div className="absolute right-0 top-full mt-1 z-40 w-48 border border-[#141618] bg-white p-1 shadow-[2px_2px_0px_#141618] divide-y divide-[#EFECE6]">
                          <div className="px-2 py-1 text-[11px] font-mono uppercase text-[#5A5D61]">
                            Update Status:
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "checked-in")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-[#FAFAF7] h-auto"
                          >
                            <span>Checked-in / Waiting</span>
                            <span className="size-2 rounded-full bg-[#D97706]"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "scheduled")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-[#FAFAF7] h-auto"
                          >
                            <span>Scheduled</span>
                            <span className="size-2 rounded-full bg-[#D8D4CC]"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "completed")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-[#FAFAF7] h-auto"
                          >
                            <span>Completed</span>
                            <span className="size-2 rounded-full bg-[#166534]"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "no-show")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-[#FAFAF7] h-auto"
                          >
                            <span>No-Show</span>
                            <span className="size-2 rounded-full bg-[#B91C1C]"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "cancelled")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-[#FAFAF7] h-auto"
                          >
                            <span>Cancelled</span>
                            <span className="size-2 rounded-full bg-[#5A5D61]"></span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reason for visit & Action Trigger */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#5A5D61] mr-1.5">
                      Reason:
                    </span>
                    <span className="text-[#141618] font-medium">
                      {apt.reason}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-auto rounded-none border border-[#141618] bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#141618] hover:bg-[#FAFAF7]"
                    >
                      <Link href={`/patients/${apt.patientId}`}>
                        View Profile
                      </Link>
                    </Button>

                    {role === "receptionist" && (
                      <Button
                        type="button"
                        variant={isWaiting ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleCheckIn(apt.id, apt.status)}
                        className={`h-auto rounded-none border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                          isWaiting
                            ? "border-[#141618] bg-white text-[#141618] hover:bg-[#FAFAF7]"
                            : "border-[#141618] bg-[#141618] text-[#FAFAF7] hover:bg-black"
                        }`}
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        <span>{isWaiting ? "Undo Check-In" : "Check In"}</span>
                      </Button>
                    )}

                    {role === "doctor" && (
                      <Button
                        asChild
                        variant={isWaiting ? "default" : "outline"}
                        size="sm"
                        className={`h-auto rounded-none border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                          isWaiting
                            ? "border-[#141618] bg-[#141618] text-[#FAFAF7] hover:bg-black"
                            : "border-[#141618] bg-white text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7]"
                        }`}
                      >
                        <Link
                          href={`/patients/${apt.patientId}/consultations/new?appointmentId=${apt.id}`}
                        >
                          <Stethoscope className="size-3 mr-1" />
                          <span>
                            {isWaiting
                              ? "Call In / Consult"
                              : "Start Consultation"}
                          </span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
