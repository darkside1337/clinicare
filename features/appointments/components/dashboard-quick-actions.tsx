"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Stethoscope, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm, DOCTORS, type FormDoctor, type FormPatient } from "./appointment-form";
import { createWalkInAppointmentAction } from "@/app/(app)/appointments/actions";
import { MOCK_SEARCH_PATIENTS } from "@/lib/mock-patients-directory";

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
  patients = MOCK_SEARCH_PATIENTS,
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
          className="hidden sm:flex items-center gap-1.5 rounded-none border border-[#141618] bg-white px-2.5 py-1 text-xs font-mono text-[#5A5D61] hover:bg-[#FAFAF7] hover:text-[#141618] h-auto"
        >
          <Search className="size-3.5 text-[#141618]" />
          <span>Search (Cmd+K)</span>
        </Button>

        {/* Book Appointment CTA */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTriggerBook}
          className="rounded-none border border-[#141618] bg-white px-2.5 py-1 text-xs font-mono text-[#141618] hover:bg-[#FAFAF7] h-auto"
        >
          <Plus className="size-3.5" />
          <span>Book</span>
        </Button>

        {/* Primary Role Action */}
        {role === "doctor" ? (
          <Button
            type="button"
            onClick={handleTriggerWalkIn}
            className="min-h-[38px] rounded-none border border-[#141618] bg-[#141618] px-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAFAF7] transition-colors hover:bg-black"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Start Walk-In Consultation</span>
          </Button>
        ) : (
          <Button
            asChild
            className="min-h-[38px] rounded-none border border-[#141618] bg-[#141618] px-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAFAF7] transition-colors hover:bg-black"
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
            <DialogHeader className="flex-row items-center justify-between border-b border-[#141618] bg-[#FAFAF7] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-[#141618]" />
                <DialogTitle>WALK-IN CONSULTATION INTAKE</DialogTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsWalkInModalOpen(false)}
                className="size-6 p-0 hover:bg-[#EFECE6] text-[#141618]"
              >
                <X className="size-3.5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogHeader>

            <form onSubmit={handleConfirmWalkIn} className="p-4 space-y-4 bg-white">
              {walkInError && (
                <div className="flex items-start gap-2 border border-[#B91C1C] bg-[#FFF5F5] p-3 text-xs text-[#B91C1C]">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{walkInError}</span>
                </div>
              )}

              {/* Patient Selection */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                  Select Arrived Patient *
                </label>
                <div className="border border-[#141618] bg-[#FAFAF7] p-1.5 max-h-36 overflow-y-auto divide-y divide-[#D8D4CC]">
                  {patients.map((p) => {
                    const isSelected = selectedPatientId === p.id;
                    return (
                      <Button
                        key={p.id}
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`w-full justify-between rounded-none p-2 h-auto text-xs font-mono transition-colors text-left ${
                          isSelected
                            ? "bg-[#141618] text-[#FAFAF7] hover:bg-black hover:text-[#FAFAF7]"
                            : "hover:bg-white text-[#141618]"
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold">{p.name}</span>
                          <span className="text-[11px] opacity-75 ml-2">({p.id} • {p.dob})</span>
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
              </div>

              {/* Practitioner Selection */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                  Assign Clinician *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {doctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <Button
                        key={doc.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="xs"
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`rounded-none border text-xs font-mono text-left justify-start p-2 h-auto flex flex-col items-start ${
                          isSelected
                            ? "border-[#141618] bg-[#141618] text-[#FAFAF7] hover:bg-black"
                            : "border-[#141618] bg-[#FAFAF7] text-[#141618] hover:bg-white"
                        }`}
                      >
                        <span className="font-bold text-[11px]">{doc.name}</span>
                        {doc.room && (
                          <span className={`text-[10px] ${isSelected ? "text-[#D8D4CC]" : "text-[#5A5D61]"}`}>
                            {doc.room}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Reason / Presenting Complaint */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                  Presenting Complaint / Reason
                </label>
                <Input
                  type="text"
                  value={walkInReason}
                  onChange={(e) => setWalkInReason(e.target.value)}
                  placeholder="e.g. Acute wrist sprain, allergic flare, shortness of breath..."
                  className="rounded-none border border-[#141618] bg-[#FAFAF7] text-xs font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D8D4CC]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWalkInModalOpen(false)}
                  disabled={isWalkInSubmitting}
                  className="rounded-none border border-[#141618] bg-white text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isWalkInSubmitting}
                  className="rounded-none border border-[#141618] bg-[#141618] text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black"
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
