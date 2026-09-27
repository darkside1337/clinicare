"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  AlertTriangle,
  Stethoscope,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CLINIC_HOURS } from "@/features/appointments/constants";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { AppointmentStatus } from "@/features/appointments/schema";
import { updateAppointmentStatusAction } from "@/app/(app)/appointments/actions";
import { STATUS_METADATA } from "./appointment-status-badge";
import { DOCTORS, type FormDoctor } from "./appointment-form";

interface DayViewProps {
  appointments: AppointmentDetails[];
  doctors?: FormDoctor[];
  onStatusChange?: (id: string, newStatus: AppointmentStatus) => void;
  onSlotClick?: (doctorName: string, timeSlot: string) => void;
  selectedClinician?: string;
  className?: string;
}

interface NormalizedAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  doctorName: string;
  timeSlot: string;
  status: AppointmentStatus;
  reason: string;
  isWalkIn: boolean;
  hasSevereAllergy: boolean;
}

function normalizeAppointment(apt: AppointmentDetails): NormalizedAppointment {
  const d = new Date(apt.scheduledAt);
  const timeSlot = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return {
    id: apt.id,
    patientId: apt.patientId,
    patientName: apt.patient.name,
    patientDob: apt.patient.dob,
    doctorName: apt.doctor.name,
    timeSlot,
    status: apt.status as AppointmentStatus,
    reason: apt.reason || "Consultation appointment",
    isWalkIn: apt.isWalkIn,
    hasSevereAllergy: !!apt.patient.hasSevereAllergy,
  };
}

export function DayView({
  appointments,
  doctors = DOCTORS,
  onStatusChange,
  onSlotClick,
  selectedClinician = "All Clinicians",
  className,
}: DayViewProps) {
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null);

  const normalized = appointments.map(normalizeAppointment);

  const visibleDoctors =
    selectedClinician === "All Clinicians"
      ? doctors
      : doctors.filter((d) => d.name === selectedClinician || d.id === selectedClinician);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    const previousStatus = normalized.find((a) => a.id === id)?.status;
    onStatusChange?.(id, newStatus);
    setActiveStatusMenuId(null);
    try {
      const result = await updateAppointmentStatusAction(id, newStatus);
      if (!result.success && previousStatus) {
        // Roll back the optimistic update so UI never diverges from the server.
        onStatusChange?.(id, previousStatus);
      }
    } catch (err) {
      console.error("Failed to update appointment status:", err);
      if (previousStatus) {
        onStatusChange?.(id, previousStatus);
      }
    }
  };

  if (visibleDoctors.length === 0) {
    return (
      <div className={`border border-primary bg-card p-12 text-center ${className || ""}`}>
        <p className="text-sm font-semibold text-foreground">No clinicians selected</p>
        <p className="text-xs text-text-muted mt-1">
          No doctor schedules match the current filter selection.
        </p>
      </div>
    );
  }

  return (
    <div className={`border border-primary bg-card shadow-[1px_1px_0px_var(--color-primary)] overflow-hidden ${className || ""}`}>
      {/* Header Row: Doctor Columns */}
      <div
        className="grid border-b border-primary bg-background"
        style={{
          gridTemplateColumns: `80px repeat(${visibleDoctors.length}, minmax(300px, 1fr))`,
        }}
      >
        <div className="p-3 border-r border-primary text-[11px] font-mono font-bold uppercase text-text-muted flex items-center justify-center">
          Time
        </div>

        {visibleDoctors.map((doc) => {
          const docAppointments = normalized.filter((a) => a.doctorName === doc.name);
          return (
            <div
              key={doc.id || doc.name}
              className="p-3 border-r border-primary last:border-r-0 space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                  {doc.name}
                </span>
                <Badge variant="outline" className="font-mono text-[11px]">
                  {docAppointments.length} Booked
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>{doc.room || "Consulting Room"}</span>
                <span>{doc.specialty || "General Practice"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Slot Rows */}
      <div className="divide-y divide-neutral-border overflow-x-auto">
        {CLINIC_HOURS.map((hour) => (
          <div
            key={hour}
            className="grid min-h-[90px] transition-colors"
            style={{
              gridTemplateColumns: `80px repeat(${visibleDoctors.length}, minmax(300px, 1fr))`,
            }}
          >
            {/* Time Axis Cell */}
            <div className="p-3 border-r border-primary bg-background font-mono text-xs font-bold text-foreground flex items-start justify-center pt-3 select-none">
              {hour}
            </div>

            {/* Doctor Slot Cells */}
            {visibleDoctors.map((doc) => {
              const apt = normalized.find(
                (a) => a.doctorName === doc.name && a.timeSlot === hour
              );

              return (
                <div
                  key={doc.id || doc.name}
                  className="p-2 border-r border-neutral-border last:border-r-0 relative group"
                >
                  {apt ? (
                    <div
                      className={`border p-2.5 h-full flex flex-col justify-between shadow-[1px_1px_0px_var(--color-primary)] ${
                        STATUS_METADATA[apt.status]?.bgClass || "bg-card border-primary"
                      }`}
                    >
                      <div className="space-y-1">
                        {/* Top row: Status Badge & Walk-in indicator */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              aria-haspopup="menu"
                              aria-expanded={activeStatusMenuId === apt.id}
                              onClick={() =>
                                setActiveStatusMenuId(
                                  activeStatusMenuId === apt.id ? null : apt.id
                                )
                              }
                              className="h-auto rounded-none border p-0 hover:bg-transparent"
                            >
                              <Badge
                                variant={STATUS_METADATA[apt.status]?.badgeVariant || "outline"}
                                className="cursor-pointer flex items-center gap-1 px-1.5 py-0.5 text-[11px]"
                              >
                                <span>{STATUS_METADATA[apt.status]?.label || apt.status}</span>
                                <ChevronDown className="size-2.5" />
                              </Badge>
                            </Button>

                            {apt.isWalkIn && (
                              <Badge className="border-primary bg-primary text-primary-foreground text-[11px] px-1 py-0 font-bold uppercase">
                                Walk-In
                              </Badge>
                            )}
                          </div>

                          {apt.hasSevereAllergy && (
                            <Badge
                              variant="destructive"
                              className="flex items-center gap-0.5 px-1 py-0 text-[11px]"
                            >
                              <AlertTriangle className="size-2.5" />
                              <span>Allergy</span>
                            </Badge>
                          )}
                        </div>

                        {/* Patient Name & Details */}
                        <div>
                          <Link
                            href={`/patients/${apt.patientId}`}
                            className="font-bold text-xs text-foreground hover:underline block truncate"
                          >
                            {apt.patientName}
                          </Link>
                          <span className="text-[11px] font-mono text-text-muted block truncate">
                            DOB: {apt.patientDob}
                          </span>
                        </div>

                        {/* Reason for encounter */}
                        <p className="text-[11px] text-text-muted line-clamp-1 italic">
                          {apt.reason}
                        </p>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-neutral-border/60 mt-1">
                        <Button
                          asChild
                          variant="outline"
                          size="xs"
                          className="rounded-none border border-primary bg-card px-2 py-0.5 text-[11px] font-mono uppercase font-bold text-foreground hover:bg-background h-auto"
                        >
                          <Link href={`/patients/${apt.patientId}`}>Profile</Link>
                        </Button>

                        <Button
                          asChild
                          variant={apt.status === "checked-in" ? "default" : "outline"}
                          size="xs"
                          className={`rounded-none border px-2 py-0.5 text-[11px] font-mono uppercase font-bold h-auto ${
                            apt.status === "checked-in"
                              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                              : "border-primary bg-card text-foreground hover:bg-background"
                          }`}
                        >
                          <Link href={`/patients/${apt.patientId}/consultations/new?appointmentId=${apt.id}`}>
                            <Stethoscope className="size-2.5 mr-0.5" />
                            <span>{apt.status === "checked-in" ? "Consult" : "Start"}</span>
                          </Link>
                        </Button>
                      </div>

                      {/* Status changer dropdown */}
                      {activeStatusMenuId === apt.id && (
                        <div className="absolute left-2 top-10 z-40 w-44 border border-primary bg-card p-1 shadow-[2px_2px_0px_var(--color-primary)] divide-y divide-muted">
                          <div className="px-2 py-1 text-[11px] font-mono uppercase text-text-muted">
                            Update Status:
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, "checked-in")}
                            className="w-full text-left justify-between rounded-none px-2 py-1 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Waiting</span>
                            <span className="size-2 rounded-full bg-clinical-warning"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, "scheduled")}
                            className="w-full text-left justify-between rounded-none px-2 py-1 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Scheduled</span>
                            <span className="size-2 rounded-full bg-neutral-border"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, "completed")}
                            className="w-full text-left justify-between rounded-none px-2 py-1 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Completed</span>
                            <span className="size-2 rounded-full bg-clinical-resolved"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, "no-show")}
                            className="w-full text-left justify-between rounded-none px-2 py-1 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>No-Show</span>
                            <span className="size-2 rounded-full bg-clinical-critical"></span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, "cancelled")}
                            className="w-full text-left justify-between rounded-none px-2 py-1 text-xs font-mono uppercase hover:bg-background h-auto"
                          >
                            <span>Cancelled</span>
                            <span className="size-2 rounded-full bg-text-muted"></span>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Empty Slot */
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onSlotClick?.(doc.name, hour)}
                      className="w-full h-full rounded-none border border-dashed border-neutral-border bg-card hover:bg-muted/40 hover:border-primary transition-colors p-2 flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-[11px] font-mono text-text-muted hover:text-foreground flex items-center gap-1">
                        <Plus className="size-3" />
                        <span>Available Slot</span>
                      </span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
