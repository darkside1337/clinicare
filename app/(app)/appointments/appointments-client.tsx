"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayView } from "@/features/appointments/components/day-view";
import {
  AppointmentForm,
  DOCTORS,
  type FormPatient,
} from "@/features/appointments/components/appointment-form";
import { CalendarControlBar } from "@/features/appointments/components/calendar-control-bar";
import type { AppointmentDetails } from "@/features/appointments/queries";
import { useOptimisticAppointments } from "@/features/appointments/hooks/use-optimistic-appointments";
import { toISODate } from "@/lib/dates/format";

interface AppointmentsClientProps {
  initialAppointments?: AppointmentDetails[];
  patients?: FormPatient[];
  currentDateISO?: string;
  currentDoctorId?: string;
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
}

export function AppointmentsClient({
  initialAppointments = [],
  patients = [],
  currentDateISO,
  currentDoctorId,
}: AppointmentsClientProps) {
  const router = useRouter();

  const activeDate = useMemo(() => {
    if (currentDateISO) {
      const parsed = new Date(currentDateISO + "T00:00:00");
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [currentDateISO]);

  const { appointments, updateStatus } = useOptimisticAppointments({
    initialAppointments,
  });

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookDoctor, setBookDoctor] = useState<string>(DOCTORS[0].name);
  const [bookTimeSlot, setBookTimeSlot] = useState<string>("10:00");

  const activeDoctor = useMemo(() => {
    if (!currentDoctorId) return "All Clinicians";
    const found = DOCTORS.find((d) => d.id === currentDoctorId);
    return found ? found.name : "All Clinicians";
  }, [currentDoctorId]);

  const navigateTo = (targetDate: Date, doctorId?: string) => {
    const params = new URLSearchParams();
    params.set("date", toISODate(targetDate));
    const effectiveDoctorId = doctorId !== undefined ? doctorId : currentDoctorId;
    if (effectiveDoctorId && effectiveDoctorId !== "all") {
      params.set("doctorId", effectiveDoctorId);
    }
    router.push(`/appointments?${params.toString()}`);
  };

  const handleSlotClick = (doctorName: string, timeSlot: string) => {
    setBookDoctor(doctorName);
    setBookTimeSlot(timeSlot);
    setIsBookModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsBookModalOpen(false);
    router.refresh();
  };

  const metrics = useMemo(() => {
    return {
      total: appointments.length,
      waiting: appointments.filter((a) => a.status === "checked-in").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      scheduled: appointments.filter((a) => a.status === "scheduled").length,
    };
  }, [appointments]);

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Page Header */}
      <div className="border-b border-primary bg-card px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold uppercase tracking-tight text-foreground">
            Appointments &amp; Schedule
          </h1>
          <p className="text-[11px] font-mono text-text-muted">
            Day View, Practitioner Timetable &amp; Slot Booking
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setBookDoctor(DOCTORS[0].name);
            setBookTimeSlot("10:00");
            setIsBookModalOpen(true);
          }}
          className="min-h-[32px] rounded-none border border-primary bg-primary px-3.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3.5 stroke-[2.5] mr-1.5" />
          <span>Book Appointment</span>
        </Button>
      </div>

      {/* Main Workspace */}
      <div className="mx-auto max-w-[1536px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Calendar Control Bar */}
        <CalendarControlBar
          activeDate={activeDate}
          currentDoctorId={currentDoctorId}
          onNavigate={navigateTo}
        />

        {/* Calendar Day Grid Census Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border border-primary bg-card p-3">
            <span className="text-[10px] font-mono uppercase text-text-muted block">
              Total Appts
            </span>
            <span className="text-xl font-bold font-mono text-foreground tabular-nums">
              {metrics.total}
            </span>
          </div>
          <div className="border border-primary bg-card p-3">
            <span className="text-[10px] font-mono uppercase text-text-muted block">
              Waiting in Clinic
            </span>
            <span className="text-xl font-bold font-mono text-clinical-warning tabular-nums">
              {metrics.waiting}
            </span>
          </div>
          <div className="border border-primary bg-card p-3">
            <span className="text-[10px] font-mono uppercase text-text-muted block">
              Scheduled Ahead
            </span>
            <span className="text-xl font-bold font-mono text-foreground tabular-nums">
              {metrics.scheduled}
            </span>
          </div>
          <div className="border border-primary bg-card p-3">
            <span className="text-[10px] font-mono uppercase text-text-muted block">
              Completed
            </span>
            <span className="text-xl font-bold font-mono text-clinical-resolved tabular-nums">
              {metrics.completed}
            </span>
          </div>
        </div>

        {/* Multi-Practitioner Day Calendar Grid */}
        <DayView
          appointments={appointments}
          onStatusChange={updateStatus}
          onSlotClick={handleSlotClick}
          selectedClinician={activeDoctor}
        />
      </div>

      {/* Booking Dialog Modal */}
      <AppointmentForm
        open={isBookModalOpen}
        onOpenChange={setIsBookModalOpen}
        patients={patients}
        initialDoctor={bookDoctor}
        initialTimeSlot={bookTimeSlot}
        initialDate={activeDate}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
