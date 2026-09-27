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
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { CLINIC_HOURS } from "@/features/appointments/constants";
import { createAppointmentSchema } from "@/features/appointments/schema";
import { createAppointmentAction } from "@/app/(app)/appointments/actions";
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
          <div role="group" aria-labelledby="apt-patient-label" className="border border-primary bg-background p-1.5 max-h-36 overflow-y-auto divide-y divide-neutral-border">
            {patients.length === 0 ? (
              <div className="p-3 text-center text-xs font-mono text-text-muted">
                No patients registered. Please register a patient before booking.
              </div>
            ) : (
              patients.map((p) => {
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
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : "hover:bg-card text-foreground"
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
                        aria-label="Severe allergy recorded"
                        className={`text-[10px] uppercase font-bold shrink-0 ml-2 ${
                          isSelected ? "bg-card text-clinical-critical" : ""
                        }`}
                      >
                        Allergy
                      </Badge>
                    )}
                  </Button>
                );
              })
            )}
          </div>
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
          <div role="group" aria-labelledby="apt-doctor-label" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {doctors.length === 0 ? (
              <div className="col-span-1 sm:col-span-3 border border-primary bg-background p-3 text-center text-xs font-mono text-text-muted">
                No practitioners registered in clinic.
              </div>
            ) : (
              doctors.map((doc) => {
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
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-primary bg-background text-foreground hover:bg-card"
                    }`}
                  >
                    <span className="font-bold text-[11px]">{doc.name}</span>
                    {doc.room && (
                      <span
                        className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-text-muted"}`}
                      >
                        {doc.room}
                      </span>
                    )}
                  </Button>
                );
              })
            )}
          </div>
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
