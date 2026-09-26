"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayView } from "@/features/appointments/components/day-view";
import {
  AppointmentForm,
  DOCTORS,
  type FormPatient,
} from "@/features/appointments/components/appointment-form";
import type { AppointmentDetails } from "@/features/appointments/queries";
import type { AppointmentStatus } from "@/features/appointments/schema";

interface AppointmentsClientProps {
  initialAppointments?: AppointmentDetails[];
  patients?: FormPatient[];
  currentDateISO?: string;
  currentDoctorId?: string;
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
}

function formatDateString(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

  const [appointments, setAppointments] =
    useState<AppointmentDetails[]>(initialAppointments);
  const [prevInitial, setPrevInitial] = useState(initialAppointments);
  const [clinicianMenuOpen, setClinicianMenuOpen] = useState(false);

  // Sync state if initialAppointments changes on router refresh without triggering cascading effect renders
  if (initialAppointments !== prevInitial) {
    setPrevInitial(initialAppointments);
    setAppointments(initialAppointments);
  }

  const activeDoctor = useMemo(() => {
    if (!currentDoctorId) return "All Clinicians";
    const found = DOCTORS.find((d) => d.id === currentDoctorId);
    return found ? found.name : "All Clinicians";
  }, [currentDoctorId]);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookDoctor, setBookDoctor] = useState<string>(DOCTORS[0].name);
  const [bookTimeSlot, setBookTimeSlot] = useState<string>("10:00");

  const navigateTo = (targetDate: Date, doctorId?: string) => {
    const params = new URLSearchParams();
    params.set("date", toISODate(targetDate));
    const effectiveDoctorId = doctorId !== undefined ? doctorId : currentDoctorId;
    if (effectiveDoctorId && effectiveDoctorId !== "all") {
      params.set("doctorId", effectiveDoctorId);
    }
    router.push(`/appointments?${params.toString()}`);
  };

  const handlePrevDay = () => {
    const prev = new Date(activeDate);
    prev.setDate(prev.getDate() - 1);
    navigateTo(prev);
  };

  const handleNextDay = () => {
    const next = new Date(activeDate);
    next.setDate(next.getDate() + 1);
    navigateTo(next);
  };

  const handleToday = () => {
    navigateTo(new Date());
  };

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
                onClick={handlePrevDay}
                className="size-8 p-0 rounded-none hover:bg-white text-[#141618]"
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous Day</span>
              </Button>
              <div className="px-3 py-1 font-mono text-xs font-bold text-[#141618] border-x border-[#141618] bg-white min-w-[200px] text-center">
                {formatDateString(activeDate)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleNextDay}
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
              onClick={handleToday}
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
                <span className="truncate">{activeDoctor}</span>
                <ChevronDown className="size-3.5 text-[#141618] shrink-0" />
              </Button>

              {clinicianMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-40 w-56 border border-[#141618] bg-white p-1 shadow-[2px_2px_0px_#141618]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setClinicianMenuOpen(false);
                      navigateTo(activeDate, "all");
                    }}
                    className={`w-full justify-start rounded-none px-2.5 py-1.5 text-xs text-left h-auto font-mono ${
                      !currentDoctorId
                        ? "bg-[#141618] text-[#FAFAF7] hover:bg-black hover:text-[#FAFAF7]"
                        : "text-[#141618] hover:bg-[#FAFAF7]"
                    }`}
                  >
                    All Clinicians
                  </Button>
                  {DOCTORS.map((doc) => (
                    <Button
                      key={doc.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setClinicianMenuOpen(false);
                        navigateTo(activeDate, doc.id);
                      }}
                      className={`w-full justify-start rounded-none px-2.5 py-1.5 text-xs text-left h-auto font-mono ${
                        currentDoctorId === doc.id
                          ? "bg-[#141618] text-[#FAFAF7] hover:bg-black hover:text-[#FAFAF7]"
                          : "text-[#141618] hover:bg-[#FAFAF7]"
                      }`}
                    >
                      {doc.name}
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
          selectedClinician={activeDoctor}
        />
      </main>

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
