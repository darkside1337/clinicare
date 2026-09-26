"use client";

import React, { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar as CalendarIcon,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CLINIC_HOURS } from "@/features/appointments/constants";
import {
  createAppointmentSchema,
  type CreateAppointmentInput,
} from "@/features/appointments/schema";
import { createAppointmentAction } from "@/app/appointments/actions";
import { MOCK_SEARCH_PATIENTS } from "@/lib/mock-patients-directory";
import type { Appointment } from "@/lib/db/schema";

export const DOCTORS = [
  {
    id: "doc-finch",
    name: "Dr. Alistair Finch",
    room: "Consulting Room 1",
    specialty: "General Practice / Lead GP",
  },
  {
    id: "doc-rostova",
    name: "Dr. Helen Rostova",
    room: "Consulting Room 2",
    specialty: "General Practice / Minor Procedures",
  },
  {
    id: "doc-brody",
    name: "Dr. Marcus Brody",
    room: "Consulting Room 3",
    specialty: "GP / Chronic Disease",
  },
];

export interface FormDoctor {
  id: string;
  name: string;
  room?: string;
  specialty?: string;
}

export interface FormPatient {
  id: string;
  name: string;
  dob: string;
  hasSevereAllergy?: boolean;
}

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctors?: FormDoctor[];
  patients?: FormPatient[];
  initialDoctorId?: string;
  initialDoctor?: string; // backwards compatibility
  initialTimeSlot?: string;
  initialDate?: string | Date;
  onSuccess?: (appointment: Appointment) => void;
}

interface AppointmentFormInnerProps {
  doctors: FormDoctor[];
  patients: FormPatient[];
  initialDoctorId?: string;
  initialDoctor?: string;
  initialTimeSlot?: string;
  initialDate?: string | Date;
  onClose: () => void;
  onSuccess?: (appointment: Appointment) => void;
}

interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  status: "scheduled" | "checked-in" | "completed" | "no-show" | "cancelled";
  isWalkIn: boolean;
  reason?: string | null;
}

function resolveInitialDoctor(
  doctors: FormDoctor[],
  initialDoctorId?: string,
  initialDoctor?: string,
): FormDoctor {
  if (initialDoctorId) {
    const found = doctors.find((d) => d.id === initialDoctorId);
    if (found) return found;
  }
  if (initialDoctor) {
    const found = doctors.find(
      (d) => d.name === initialDoctor || d.id === initialDoctor,
    );
    if (found) return found;
  }
  return doctors[0] || { id: "doc-default", name: "Default Doctor" };
}

function computeScheduledAt(
  timeSlot: string,
  initialDate?: string | Date,
): Date {
  const [hours, minutes] = timeSlot.split(":").map(Number);
  const base = initialDate ? new Date(initialDate) : new Date();
  const scheduled = new Date(base);
  scheduled.setHours(
    isNaN(hours) ? 9 : hours,
    isNaN(minutes) ? 0 : minutes,
    0,
    0,
  );
  return scheduled;
}

function AppointmentFormInner({
  doctors,
  patients,
  initialDoctorId,
  initialDoctor,
  initialTimeSlot = "10:00",
  initialDate,
  onClose,
  onSuccess,
}: AppointmentFormInnerProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultDoctor = resolveInitialDoctor(
    doctors,
    initialDoctorId,
    initialDoctor,
  );
  const defaultPatient = patients[0] || {
    id: "pat-default",
    name: "Default Patient",
    dob: "01/01/1990",
  };

  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<string>(initialTimeSlot);

  const {
    handleSubmit,
    control,
    setValue,
    register,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema) as unknown as Resolver<
      AppointmentFormData
    >,
    defaultValues: {
      patientId: defaultPatient.id,
      doctorId: defaultDoctor.id,
      scheduledAt: computeScheduledAt(initialTimeSlot, initialDate),
      status: "scheduled",
      isWalkIn: false,
      reason: "",
    },
  });

  const watchedPatientId = useWatch({ control, name: "patientId" });
  const watchedDoctorId = useWatch({ control, name: "doctorId" });
  const watchedIsWalkIn = useWatch({ control, name: "isWalkIn" });

  const handleSelectTimeSlot = (slot: string) => {
    setSelectedTimeSlot(slot);
    setValue("scheduledAt", computeScheduledAt(slot, initialDate), {
      shouldValidate: true,
    });
  };

  const handleToggleWalkIn = () => {
    const nextWalkIn = !watchedIsWalkIn;
    setValue("isWalkIn", nextWalkIn);
    setValue("status", nextWalkIn ? "checked-in" : "scheduled");
  };

  const handleFormSubmit = async (data: AppointmentFormData) => {
    setServerError(null);
    try {
      const res = await createAppointmentAction(data);
      if (!res.success) {
        setServerError(res.error);
        return;
      }

      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Failed to book appointment. Please try again.",
      );
    }
  };

  return (
    <>
      <DialogHeader className="flex-row items-center justify-between border-b border-[#141618] bg-[#FAFAF7] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-[#141618]" />
          <DialogTitle>BOOK CLINIC APPOINTMENT</DialogTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onClose}
          className="size-6 p-0 hover:bg-[#EFECE6] text-[#141618]"
        >
          <X className="size-3.5" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogHeader>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="p-4 space-y-4 bg-white"
      >
        {serverError && (
          <div className="flex items-start gap-2 border border-[#B91C1C] bg-[#FFF5F5] p-3 text-xs text-[#B91C1C]">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Patient Selection */}
        <div>
          <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
            Select Patient *
          </label>
          <div className="border border-[#141618] bg-[#FAFAF7] p-1.5 max-h-36 overflow-y-auto divide-y divide-[#D8D4CC]">
            {patients.map((p) => {
              const isSelected = watchedPatientId === p.id;
              return (
                <Button
                  key={p.id}
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setValue("patientId", p.id, { shouldValidate: true })
                  }
                  className={`w-full justify-between rounded-none p-2 h-auto text-xs font-mono transition-colors text-left ${
                    isSelected
                      ? "bg-[#141618] text-[#FAFAF7] hover:bg-black hover:text-[#FAFAF7]"
                      : "hover:bg-white text-[#141618]"
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-[11px] opacity-75 ml-2">
                      ({p.id} • {p.dob})
                    </span>
                  </div>
                  {p.hasSevereAllergy && (
                    <Badge
                      variant="destructive"
                      className={`text-[10px] uppercase font-bold shrink-0 ml-2 ${
                        isSelected ? "bg-white text-[#B91C1C]" : ""
                      }`}
                    >
                      Allergy
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
          {errors.patientId && (
            <p className="text-[11px] font-mono text-[#B91C1C] mt-1">
              {errors.patientId.message}
            </p>
          )}
        </div>

        {/* Clinician Picker */}
        <div>
          <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
            Practitioner *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {doctors.map((doc) => {
              const isSelected = watchedDoctorId === doc.id;
              return (
                <Button
                  key={doc.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="xs"
                  onClick={() =>
                    setValue("doctorId", doc.id, { shouldValidate: true })
                  }
                  className={`rounded-none border text-xs font-mono text-left justify-start p-2 h-auto flex flex-col items-start ${
                    isSelected
                      ? "border-[#141618] bg-[#141618] text-[#FAFAF7] hover:bg-black"
                      : "border-[#141618] bg-[#FAFAF7] text-[#141618] hover:bg-white"
                  }`}
                >
                  <span className="font-bold text-[11px]">{doc.name}</span>
                  {doc.room && (
                    <span
                      className={`text-[10px] ${isSelected ? "text-[#D8D4CC]" : "text-[#5A5D61]"}`}
                    >
                      {doc.room}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          {errors.doctorId && (
            <p className="text-[11px] font-mono text-[#B91C1C] mt-1">
              {errors.doctorId.message}
            </p>
          )}
        </div>

        {/* Time Slot Picker */}
        <div>
          <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
            Appointment Time *
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-1 border border-[#141618] bg-[#FAFAF7] p-2">
            {CLINIC_HOURS.map((slot) => {
              const isSelected = selectedTimeSlot === slot;
              return (
                <Button
                  key={slot}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="xs"
                  onClick={() => handleSelectTimeSlot(slot)}
                  className={`rounded-none border font-mono text-[11px] h-7 ${
                    isSelected
                      ? "border-[#141618] bg-[#141618] text-[#FAFAF7] hover:bg-black"
                      : "border-[#D8D4CC] bg-white text-[#141618] hover:border-[#141618]"
                  }`}
                >
                  {slot}
                </Button>
              );
            })}
          </div>
          {errors.scheduledAt && (
            <p className="text-[11px] font-mono text-[#B91C1C] mt-1">
              {errors.scheduledAt.message}
            </p>
          )}
        </div>

        {/* Visit Reason */}
        <div>
          <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
            Presenting Complaint / Reason
          </label>
          <Input
            type="text"
            {...register("reason")}
            placeholder="e.g. Follow-up consultation, chest tightness, routine review..."
            className="rounded-none border border-[#141618] bg-[#FAFAF7] text-xs font-mono"
          />
          {errors.reason && (
            <p className="text-[11px] font-mono text-[#B91C1C] mt-1">
              {errors.reason.message}
            </p>
          )}
        </div>

        {/* Walk-In Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleWalkIn}
            className={`rounded-none border text-xs font-mono uppercase font-bold ${
              watchedIsWalkIn
                ? "border-[#141618] bg-[#141618] text-[#FAFAF7]"
                : "border-[#141618] bg-white text-[#141618]"
            }`}
          >
            {watchedIsWalkIn
              ? "✓ Patient is Walk-In (Checked-In Now)"
              : "+ Mark as Walk-In"}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D8D4CC]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-none border border-[#141618] bg-white text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-none border border-[#141618] bg-[#141618] text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Booking...</span>
              </>
            ) : (
              <span>Confirm &amp; Book</span>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

export function AppointmentForm({
  open,
  onOpenChange,
  doctors = DOCTORS,
  patients = MOCK_SEARCH_PATIENTS,
  initialDoctorId,
  initialDoctor,
  initialTimeSlot,
  initialDate,
  onSuccess,
}: AppointmentFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="overflow-hidden">
        {open && (
          <AppointmentFormInner
            key={`${initialDoctorId || initialDoctor || ""}-${initialTimeSlot || ""}`}
            doctors={doctors}
            patients={patients}
            initialDoctorId={initialDoctorId}
            initialDoctor={initialDoctor}
            initialTimeSlot={initialTimeSlot}
            initialDate={initialDate}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogPopup>
    </Dialog>
  );
}
