"use client";

import React, { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar as CalendarIcon,
  X,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import {
  CLINIC_HOURS,
  DOCTORS,
  type FormDoctor,
  type FormPatient,
} from "@/features/appointments/constants";
import { PatientPickerList } from "./patient-picker-list";
import { DoctorGridPicker } from "./doctor-grid-picker";
import { createAppointmentSchema } from "@/features/appointments/schema";
import { createAppointmentAction } from "@/app/(app)/appointments/actions";
import type { Appointment } from "@/lib/db/schema";

export { DOCTORS, type FormDoctor, type FormPatient };

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
): FormDoctor | undefined {
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
  return doctors[0];
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
  const defaultPatient = patients[0];

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
      patientId: defaultPatient?.id ?? "",
      doctorId: defaultDoctor?.id ?? "",
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
    if (!data.patientId) {
      setServerError("Please select a patient before booking.");
      return;
    }
    if (!data.doctorId) {
      setServerError("Please select a practitioner before booking.");
      return;
    }
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
      <DialogHeader className="flex-row items-center justify-between border-b border-primary bg-background px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-foreground" />
          <DialogTitle>BOOK CLINIC APPOINTMENT</DialogTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onClose}
          className="size-6 p-0 hover:bg-muted text-foreground"
        >
          <X className="size-3.5" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogHeader>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="p-4 space-y-4 bg-card"
      >
        <FormErrorAlert message={serverError} />

        {/* Patient Selection */}
        <div>
          <span id="apt-patient-label" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
            Select Patient *
          </span>
          <PatientPickerList
            patients={patients}
            selectedPatientId={watchedPatientId}
            onSelectPatient={(id) => setValue("patientId", id, { shouldValidate: true })}
            groupId="apt-patient-label"
          />
          {errors.patientId && (
            <p role="alert" className="text-[11px] font-mono text-clinical-critical mt-1">
              {errors.patientId.message}
            </p>
          )}
        </div>

        {/* Clinician Picker */}
        <div>
          <span id="apt-doctor-label" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
            Practitioner *
          </span>
          <DoctorGridPicker
            doctors={doctors}
            selectedDoctorId={watchedDoctorId}
            onSelectDoctor={(id) => setValue("doctorId", id, { shouldValidate: true })}
            groupId="apt-doctor-label"
          />
          {errors.doctorId && (
            <p role="alert" className="text-[11px] font-mono text-clinical-critical mt-1">
              {errors.doctorId.message}
            </p>
          )}
        </div>

        {/* Time Slot Picker */}
        <div>
          <span id="apt-time-label" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
            Appointment Time *
          </span>
          <div role="group" aria-labelledby="apt-time-label" className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-1 border border-primary bg-background p-2">
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
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-neutral-border bg-card text-foreground hover:border-primary"
                  }`}
                >
                  {slot}
                </Button>
              );
            })}
          </div>
          {errors.scheduledAt && (
            <p role="alert" className="text-[11px] font-mono text-clinical-critical mt-1">
              {errors.scheduledAt.message}
            </p>
          )}
        </div>

        {/* Visit Reason */}
        <div>
          <label htmlFor="apt-reason" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
            Presenting Complaint / Reason
          </label>
          <Input
            id="apt-reason"
            type="text"
            {...register("reason")}
            placeholder="e.g. Follow-up consultation, chest tightness, routine review..."
            className="rounded-none border border-primary bg-background text-xs font-mono"
          />
          {errors.reason && (
            <p role="alert" className="text-[11px] font-mono text-clinical-critical mt-1">
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
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary bg-card text-foreground"
            }`}
          >
            {watchedIsWalkIn
              ? "✓ Patient is Walk-In (Checked-In Now)"
              : "+ Mark as Walk-In"}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-none border border-primary bg-card text-xs font-mono uppercase font-bold text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || patients.length === 0 || doctors.length === 0}
            className="rounded-none border border-primary bg-primary text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-primary/90"
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
  patients = [],
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
