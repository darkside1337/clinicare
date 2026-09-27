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
import { EmptyState } from "@/components/ui/empty-state";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { AppointmentStatus } from "@/features/appointments/schema";
import { updateAppointmentStatusAction } from "@/app/(app)/appointments/actions";

export type StatusType = AppointmentStatus;

import { DASHBOARD_STATUS_CONFIG } from "@/features/appointments/status";
export { DASHBOARD_STATUS_CONFIG };

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

import { calculateAge } from "@/lib/dates/calculate-age";

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
    const previousStatus = normalized.find((a) => a.id === id)?.status;
    onStatusChange?.(id, newStatus);
    setStatusMenuOpenId(null);
    try {
      const result = await updateAppointmentStatusAction(id, newStatus);
      if (!result.success && previousStatus) {
        // Roll back the optimistic update so UI never diverges from the server.
        onStatusChange?.(id, previousStatus);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      if (previousStatus) {
        onStatusChange?.(id, previousStatus);
      }
    }
  };

  const handleToggleCheckIn = async (id: string, currentStatus: AppointmentStatus) => {
    const nextStatus: AppointmentStatus = currentStatus === "checked-in" ? "scheduled" : "checked-in";
    await handleStatusSelect(id, nextStatus);
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Practitioner Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary pb-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-foreground" />
            <h1 className="text-base font-bold uppercase tracking-wider text-foreground">
              Today&apos;s Clinic Appointments
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time patient check-in status and daily encounter queue.
          </p>
        </div>

        {/* Doctor Clinician Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
            Filter Clinician:
          </span>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDoctorMenuOpen(!doctorMenuOpen)}
              className="rounded-none border border-primary bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background flex items-center justify-between gap-2 min-w-[170px]"
            >
              <span className="truncate">{selectedDoctor}</span>
              <ChevronDown className="size-3.5 text-foreground shrink-0" />
            </Button>

            {doctorMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-40 w-56 border border-primary bg-card p-1 shadow-[2px_2px_0px_var(--color-primary)]">
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
                        ? "bg-primary text-primary-foreground hover:bg-black hover:text-primary-foreground"
                        : "text-foreground hover:bg-background"
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
        <EmptyState
          icon={<Calendar className="size-8" />}
          title="No appointments scheduled"
          hint="There are no scheduled visits matching the selected practitioner today."
          className="p-12"
        />
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => {
            const config = DASHBOARD_STATUS_CONFIG[apt.status] || DASHBOARD_STATUS_CONFIG.scheduled;
            const isWaiting = apt.status === "checked-in";

            return (
              <article
                key={apt.id}
                className={`border border-primary ${config.rowBg} p-4 shadow-[1px_1px_0px_var(--color-primary)] transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-border pb-3">
                  {/* Time slot & Patient Identity */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground bg-card border border-primary px-2 py-0.5 shrink-0">
                      <Clock className="size-3.5 text-text-muted" />
                      <span>{apt.timeSlot}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/patients/${apt.patientId}`}
                          className="text-sm font-bold text-foreground hover:underline"
                        >
                          {apt.patientName}
                        </Link>
                        <span className="text-xs font-mono text-text-muted">
                          ({apt.patientAge !== null ? `${apt.patientAge}y • ` : ""}DOB: {apt.patientDob})
                        </span>
                        {apt.isWalkIn && (
                          <Badge className="border-primary bg-primary text-primary-foreground">
                            Walk-In
                          </Badge>
                        )}
                        {role === "doctor" && apt.allergyFlag && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 font-mono text-[10px]"
                          >
                            <AlertTriangle className="size-3" />
                            <span>Allergy</span>
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-text-muted mt-0.5 block">
                        Assigned Clinician:{" "}
                        <strong className="text-foreground">
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
                        aria-haspopup="menu"
                        aria-expanded={statusMenuOpenId === apt.id}
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
                        <div className="absolute right-0 top-full mt-1 z-40 w-48 border border-primary bg-card p-1 shadow-[2px_2px_0px_var(--color-primary)] divide-y divide-muted">
                          <div className="px-2 py-1 text-[11px] font-mono uppercase text-text-muted">
                            Update Status:
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "checked-in")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Checked-in / Waiting</span>
                            <span className="size-2 rounded-full bg-clinical-warning"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "scheduled")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Scheduled</span>
                            <span className="size-2 rounded-full bg-neutral-border"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "completed")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Completed</span>
                            <span className="size-2 rounded-full bg-clinical-resolved"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "no-show")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>No-Show</span>
                            <span className="size-2 rounded-full bg-clinical-critical"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusSelect(apt.id, "cancelled")
                            }
                            className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Cancelled</span>
                            <span className="size-2 rounded-full bg-text-muted"></span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reason for visit & Action Trigger */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted mr-1.5">
                      Reason:
                    </span>
                    <span className="text-foreground font-medium">
                      {apt.reason}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-auto rounded-none border border-primary bg-card px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-background"
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
                            ? "border-primary bg-card text-foreground hover:bg-background"
                            : "border-primary bg-primary text-primary-foreground hover:bg-black"
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
                            ? "border-primary bg-primary text-primary-foreground hover:bg-black"
                            : "border-primary bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
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
