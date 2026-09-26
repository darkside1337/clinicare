"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClinicAppointment,
  AppointmentStatus,
  INITIAL_CALENDAR_APPOINTMENTS,
} from "@/lib/mock-appointments";
import { DayView } from "@/features/appointments/components/day-view";
import {
  AppointmentForm,
  DOCTORS,
} from "@/features/appointments/components/appointment-form";
import type { Appointment as DbAppointment } from "@/lib/db/schema";


interface AppointmentsClientProps {
  initialAppointments?: ClinicAppointment[];
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
}

export function AppointmentsClient({
  initialAppointments = INITIAL_CALENDAR_APPOINTMENTS,
  sessionRole = "doctor",
  sessionUserName,
}: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>(initialAppointments);
  const [selectedClinician, setSelectedClinician] = useState<string>("All Clinicians");
  const [currentDateStr, setCurrentDateStr] = useState<string>("Thursday 24/09/2026");
  const [clinicianMenuOpen, setClinicianMenuOpen] = useState(false);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookDoctor, setBookDoctor] = useState<string>(DOCTORS[0].name);
  const [bookTimeSlot, setBookTimeSlot] = useState<string>("10:00");

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const handleSlotClick = (doctorName: string, timeSlot: string) => {
    setBookDoctor(doctorName);
    setBookTimeSlot(timeSlot);
    setIsBookModalOpen(true);
  };

  const handleCreateSuccess = (newApt: DbAppointment) => {
    const d =
      newApt.scheduledAt instanceof Date
        ? newApt.scheduledAt
        : new Date(newApt.scheduledAt);
    const timeSlot = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
    const doctorName =
      DOCTORS.find((doc) => doc.id === newApt.doctorId)?.name ??
      newApt.doctorId;
    const mapped: ClinicAppointment = {
      id: newApt.id,
      patientId: newApt.patientId,
      patientName: newApt.patientId,
      patientDob: "",
      doctorName,
      timeSlot,
      durationMinutes: 30,
      status: newApt.status,
      reason: newApt.reason ?? "",
      isWalkIn: newApt.isWalkIn,
      allergyFlag: false,
    };
    setAppointments((prev) => [...prev, mapped]);
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
    <div className="min-h-full bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Page Header */}
      <div className="border-b border-[#141618] bg-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold uppercase tracking-tight text-[#141618]">
            Appointments & Schedule
          </h1>
          <p className="text-[11px] font-mono text-[#5A5D61]">
            Day View, Practitioner Timetable & Slot Booking
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setBookDoctor(DOCTORS[0].name);
            setBookTimeSlot("10:00");
            setIsBookModalOpen(true);
          }}
          className="min-h-[32px] rounded-none border border-[#141618] bg-[#141618] px-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAFAF7] transition-colors hover:bg-black"
        >
          <Plus className="size-3.5 stroke-[2.5] mr-1.5" />
          <span>Book Appointment</span>
        </Button>
      </div>

      {/* Main Workspace */}
      <main className="mx-auto max-w-[1536px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Calendar Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#141618] bg-white p-3 sm:p-4 shadow-[1px_1px_0px_#141618]">
          {/* Date Selector Navigation */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-[#141618] bg-[#FAFAF7]">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setCurrentDateStr("Wednesday 23/09/2026")}
                className="size-8 p-0 rounded-none hover:bg-white text-[#141618]"
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous Day</span>
              </Button>
              <div className="px-3 py-1 font-mono text-xs font-bold text-[#141618] border-x border-[#141618] bg-white min-w-[180px] text-center">
                {currentDateStr}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setCurrentDateStr("Friday 25/09/2026")}
                className="size-8 p-0 rounded-none hover:bg-white text-[#141618]"
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Next Day</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentDateStr("Thursday 24/09/2026")}
              className="rounded-none border-[#141618] text-xs font-mono uppercase h-8 hover:bg-[#FAFAF7]"
            >
              Today
            </Button>
          </div>

          {/* Clinician Column Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61]">
              View Columns:
            </span>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setClinicianMenuOpen(!clinicianMenuOpen)}
                className="rounded-none border-[#141618] bg-white px-3 py-1.5 text-xs font-mono text-[#141618] hover:bg-[#FAFAF7] flex items-center justify-between gap-2 min-w-[200px]"
              >
                <span className="truncate">{selectedClinician}</span>
                <ChevronDown className="size-3.5 text-[#141618] shrink-0" />
              </Button>

              {clinicianMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-40 w-56 border border-[#141618] bg-white p-1 shadow-[2px_2px_0px_#141618]">
                  {["All Clinicians", ...DOCTORS.map((d) => d.name)].map((doc) => (
                    <Button
                      key={doc}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClinician(doc);
                        setClinicianMenuOpen(false);
                      }}
                      className={`w-full justify-start rounded-none px-2.5 py-1.5 text-xs text-left h-auto font-mono ${
                        selectedClinician === doc
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

        {/* Calendar Day Grid Census Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border border-[#141618] bg-white p-3">
            <span className="text-[10px] font-mono uppercase text-[#5A5D61] block">
              Total Appts
            </span>
            <span className="text-xl font-bold font-mono text-[#141618]">
              {metrics.total}
            </span>
          </div>
          <div className="border border-[#141618] bg-white p-3">
            <span className="text-[10px] font-mono uppercase text-[#5A5D61] block">
              Waiting in Clinic
            </span>
            <span className="text-xl font-bold font-mono text-[#D97706]">
              {metrics.waiting}
            </span>
          </div>
          <div className="border border-[#141618] bg-white p-3">
            <span className="text-[10px] font-mono uppercase text-[#5A5D61] block">
              Scheduled Ahead
            </span>
            <span className="text-xl font-bold font-mono text-[#141618]">
              {metrics.scheduled}
            </span>
          </div>
          <div className="border border-[#141618] bg-white p-3">
            <span className="text-[10px] font-mono uppercase text-[#5A5D61] block">
              Completed
            </span>
            <span className="text-xl font-bold font-mono text-[#166534]">
              {metrics.completed}
            </span>
          </div>
        </div>

        {/* Multi-Practitioner Day Calendar Grid */}
        <DayView
          appointments={appointments}
          onStatusChange={handleStatusChange}
          onSlotClick={handleSlotClick}
          selectedClinician={selectedClinician}
        />
      </main>

      {/* Booking Dialog Modal */}
      <AppointmentForm
        open={isBookModalOpen}
        onOpenChange={setIsBookModalOpen}
        initialDoctor={bookDoctor}
        initialTimeSlot={bookTimeSlot}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
