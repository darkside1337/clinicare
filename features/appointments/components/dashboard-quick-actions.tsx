"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Stethoscope, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm, DOCTORS, type FormDoctor, type FormPatient } from "./appointment-form";
import { PatientPickerList } from "./patient-picker-list";
import { DoctorGridPicker } from "./doctor-grid-picker";
import { createWalkInAppointmentAction } from "@/app/(app)/appointments/actions";

interface DashboardQuickActionsProps {
  role?: "doctor" | "receptionist";
  doctors?: FormDoctor[];
  patients?: FormPatient[];
  onOpenSearch?: () => void;
  onStartWalkIn?: () => void;
  onBookAppointment?: () => void;
  className?: string;
}

export function DashboardQuickActions({
  role = "doctor",
  doctors = DOCTORS,
  patients = [],
  onOpenSearch,
  onStartWalkIn,
  onBookAppointment,
  className,
}: DashboardQuickActionsProps) {
  const router = useRouter();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Walk-in form state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "");
  const [walkInReason, setWalkInReason] = useState<string>("");
  const [isWalkInSubmitting, setIsWalkInSubmitting] = useState(false);
  const [walkInError, setWalkInError] = useState<string | null>(null);

  const handleOpenSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      window.dispatchEvent(new CustomEvent("clinicare:open-search"));
    }
  };

  const handleTriggerBook = () => {
    if (onBookAppointment) {
      onBookAppointment();
    } else {
      setIsBookModalOpen(true);
    }
  };

  const handleTriggerWalkIn = () => {
    if (onStartWalkIn) {
      onStartWalkIn();
    } else {
      setWalkInError(null);
      setWalkInReason("");
      setSelectedPatientId(patients[0]?.id || "");
      setSelectedDoctorId(doctors[0]?.id || "");
      setIsWalkInModalOpen(true);
    }
  };

  const handleConfirmWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError(null);

    if (!selectedPatientId) {
      setWalkInError("Please select a patient.");
      return;
    }
    if (!selectedDoctorId) {
      setWalkInError("Please select a practitioner.");
      return;
    }

    setIsWalkInSubmitting(true);
    try {
      const res = await createWalkInAppointmentAction({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        reason: walkInReason.trim() || "Walk-in consultation",
      });

      if (!res.success) {
        setWalkInError(res.error);
        setIsWalkInSubmitting(false);
        return;
      }

      setIsWalkInSubmitting(false);
      setIsWalkInModalOpen(false);
      router.refresh();
    } catch (err) {
      setIsWalkInSubmitting(false);
      setWalkInError(
        err instanceof Error ? err.message : "Failed to register walk-in. Please try again."
      );
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className || ""}`}>
        {/* Quick Search Shortcut */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenSearch}
          className="hidden sm:flex items-center gap-1.5 rounded-none border border-primary bg-card px-2.5 py-1 text-xs font-mono text-text-muted hover:bg-muted hover:text-foreground h-auto"
        >
          <Search className="size-3.5 text-foreground" />
          <span>Search (Cmd+K)</span>
        </Button>

        {/* Book Appointment CTA */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTriggerBook}
          className="rounded-none border border-primary bg-card px-2.5 py-1 text-xs font-mono text-foreground hover:bg-muted h-auto"
        >
          <Plus className="size-3.5" />
          <span>Book</span>
        </Button>

        {/* Primary Role Action */}
        {role === "doctor" ? (
          <Button
            type="button"
            onClick={handleTriggerWalkIn}
            className="min-h-[38px] rounded-none border border-primary bg-primary px-3.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Start Walk-In Consultation</span>
          </Button>
        ) : (
          <Button
            asChild
            className="min-h-[38px] rounded-none border border-primary bg-primary px-3.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Link href="/patients/new">
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>Register New Patient</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Embedded Booking Modal when not externally controlled */}
      {!onBookAppointment && (
        <AppointmentForm
          open={isBookModalOpen}
          onOpenChange={setIsBookModalOpen}
          doctors={doctors}
          patients={patients}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Embedded Walk-In Modal when not externally controlled */}
      {!onStartWalkIn && (
        <Dialog open={isWalkInModalOpen} onOpenChange={setIsWalkInModalOpen}>
          <DialogPopup className="overflow-hidden">
            <DialogHeader className="flex-row items-center justify-between border-b border-primary bg-background px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-foreground" />
                <DialogTitle>WALK-IN CONSULTATION INTAKE</DialogTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsWalkInModalOpen(false)}
                className="size-6 p-0 hover:bg-muted text-foreground"
              >
                <X className="size-3.5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogHeader>

            <form onSubmit={handleConfirmWalkIn} className="p-4 space-y-4 bg-card">
              <FormErrorAlert message={walkInError} />

              {/* Patient Selection */}
              <div>
                <span id="quick-patient-label" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
                  Select Arrived Patient *
                </span>
                <PatientPickerList
                  patients={patients}
                  selectedPatientId={selectedPatientId}
                  onSelectPatient={setSelectedPatientId}
                  groupId="quick-patient-label"
                />
              </div>

              {/* Practitioner Selection */}
              <div>
                <span id="quick-doctor-label" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
                  Assign Clinician *
                </span>
                <DoctorGridPicker
                  doctors={doctors}
                  selectedDoctorId={selectedDoctorId}
                  onSelectDoctor={setSelectedDoctorId}
                  groupId="quick-doctor-label"
                />
              </div>

              {/* Reason / Presenting Complaint */}
              <div>
                <label htmlFor="quick-walkin-reason" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
                  Presenting Complaint / Reason
                </label>
                <Input
                  id="quick-walkin-reason"
                  type="text"
                  value={walkInReason}
                  onChange={(e) => setWalkInReason(e.target.value)}
                  placeholder="e.g. Acute wrist sprain, allergic flare, shortness of breath..."
                  className="rounded-none border border-primary bg-background text-xs font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWalkInModalOpen(false)}
                  disabled={isWalkInSubmitting}
                  className="rounded-none border border-primary bg-card text-xs font-mono uppercase font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isWalkInSubmitting}
                  className="rounded-none border border-primary bg-primary text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-primary/90"
                >
                  {isWalkInSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      <span>Checking In...</span>
                    </>
                  ) : (
                    <span>Check In Walk-In</span>
                  )}
                </Button>
              </div>
            </form>
          </DialogPopup>
        </Dialog>
      )}
    </>
  );
}
