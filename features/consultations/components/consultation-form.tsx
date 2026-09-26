"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  consultationSchema,
  type ConsultationInput,
} from "@/features/consultations/schema";
import { createConsultationAction } from "@/app/patients/[id]/consultations/new/actions";
import { updateConsultationAction } from "@/app/patients/[id]/consultations/[consultationId]/actions";
import type { Consultation } from "@/lib/db/schema";

export interface ConsultationFormProps {
  patientId?: string;
  consultationId?: string;
  appointmentId?: string;
  initialData?: Partial<ConsultationInput>;
  doctorName?: string;
  encounterType?: "Scheduled" | "Walk-In";
  onSuccess?: (consultation: Consultation) => void;
  onSubmit?: (data: ConsultationInput) => void;
  isSubmitting?: boolean;
}

export function ConsultationForm({
  patientId,
  consultationId,
  appointmentId,
  initialData,
  doctorName,
  encounterType: initialEncounterType = "Scheduled",
  onSuccess,
  onSubmit: externalOnSubmit,
  isSubmitting: externalSubmitting,
}: ConsultationFormProps) {
  const [encounterType, setEncounterType] = useState<"Scheduled" | "Walk-In">(
    initialEncounterType
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      chiefComplaint: initialData?.chiefComplaint || "",
      symptoms: initialData?.symptoms || "",
      observations: initialData?.observations || "",
      diagnosis: initialData?.diagnosis || "",
      treatment: initialData?.treatment || "",
      notes: initialData?.notes || "",
    },
  });

  const isSubmitting = externalSubmitting ?? formSubmitting;

  const handleFormSubmit = async (data: ConsultationInput) => {
    setServerError(null);

    if (externalOnSubmit) {
      externalOnSubmit(data);
      return;
    }

    if (!patientId) {
      setServerError("Patient ID is missing.");
      return;
    }

    if (consultationId) {
      // Update mode
      const result = await updateConsultationAction(
        patientId,
        consultationId,
        data
      );
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      if (onSuccess) {
        onSuccess(result.data);
      }
    } else {
      // Create mode
      const result = await createConsultationAction(patientId, {
        ...data,
        appointmentId,
      });
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      if (onSuccess) {
        onSuccess(result.data);
      }
    }
  };

  return (
    <form
      id="consultation-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {serverError && (
        <div className="flex items-start gap-2 border border-red-600 bg-red-50 p-3 text-xs text-red-900 font-mono">
          <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <strong className="font-bold">Error:</strong> {serverError}
          </div>
        </div>
      )}

      <div className="border border-[#141618] bg-white p-5 sm:p-6 space-y-6 shadow-[2px_2px_0px_#141618]">
        {/* Encounter Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#D8D4CC] pb-4 text-xs font-mono">
          <div>
            <span className="block text-[10px] uppercase text-[#5A5D61] font-bold mb-1">
              Encounter Type
            </span>
            <div className="flex items-center border border-[#141618] bg-white h-8">
              {(["Scheduled", "Walk-In"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setEncounterType(type)}
                  className={`flex-1 rounded-none text-xs font-mono uppercase font-bold h-full ${
                    encounterType === type
                      ? "bg-[#141618] text-[#FAFAF7] hover:bg-black hover:text-[#FAFAF7]"
                      : "text-[#5A5D61] hover:bg-[#FAFAF7]"
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] uppercase text-[#5A5D61] font-bold mb-1">
              Linked Appointment
            </span>
            <div className="h-8 flex items-center px-2 bg-[#FAFAF7] border border-[#D8D4CC] text-xs text-[#141618]">
              {appointmentId ? `ID: ${appointmentId.slice(0, 8)}…` : "Auto-linked (Walk-In)"}
            </div>
          </div>

          <div>
            <span className="block text-[10px] uppercase text-[#5A5D61] font-bold mb-1">
              Clinician
            </span>
            <div className="h-8 flex items-center px-2 bg-[#FAFAF7] border border-[#D8D4CC] text-xs font-bold text-[#141618]">
              {doctorName || "Lead Practitioner"}
            </div>
          </div>
        </div>

        {/* 1. Chief Complaint (Free text per PRD §8.6) */}
        <div className="space-y-1.5">
          <label
            htmlFor="chiefComplaint"
            className="block text-xs font-bold uppercase tracking-wider text-[#141618]"
          >
            1. Chief Complaint <span className="text-red-600">*</span>
          </label>
          <Input
            id="chiefComplaint"
            {...register("chiefComplaint")}
            placeholder="e.g. 3-day history of right flank pain and dysuria..."
            className="w-full rounded-none border border-[#141618] bg-[#FAFAF7] p-2 text-xs text-[#141618] focus-visible:ring-1 focus-visible:ring-[#141618]"
          />
          {errors.chiefComplaint && (
            <p className="text-[11px] font-mono text-red-600 mt-1">
              {errors.chiefComplaint.message}
            </p>
          )}
        </div>

        {/* 2. Symptoms (Free text per PRD §8.6) */}
        <div className="space-y-1.5">
          <label
            htmlFor="symptoms"
            className="block text-xs font-bold uppercase tracking-wider text-[#141618]"
          >
            2. Symptoms &amp; History
          </label>
          <Textarea
            id="symptoms"
            rows={3}
            {...register("symptoms")}
            placeholder="Onset, character, severity, radiation, timing, exacerbating/relieving factors..."
            className="w-full rounded-none border border-[#141618] bg-[#FAFAF7] p-2 text-xs text-[#141618] focus-visible:ring-1 focus-visible:ring-[#141618]"
          />
        </div>

        {/* 3. Observations (Free text per PRD §8.6) */}
        <div className="space-y-1.5">
          <label
            htmlFor="observations"
            className="block text-xs font-bold uppercase tracking-wider text-[#141618]"
          >
            3. Clinical Observations &amp; Physical Examination
          </label>
          <Textarea
            id="observations"
            rows={3}
            {...register("observations")}
            placeholder="Vital signs, physical exam observations, general appearance..."
            className="w-full rounded-none border border-[#141618] bg-[#FAFAF7] p-2 text-xs font-mono text-[#141618] focus-visible:ring-1 focus-visible:ring-[#141618]"
          />
        </div>

        {/* 4. Diagnosis (Free text per PRD §8.6) */}
        <div className="space-y-1.5">
          <label
            htmlFor="diagnosis"
            className="block text-xs font-bold uppercase tracking-wider text-[#141618]"
          >
            4. Primary Clinical Diagnosis / Working Impression
          </label>
          <Input
            id="diagnosis"
            type="text"
            {...register("diagnosis")}
            placeholder="Free text working clinical diagnosis..."
            className="w-full rounded-none border border-[#141618] bg-[#FAFAF7] p-2 text-xs font-semibold text-[#141618] focus-visible:ring-1 focus-visible:ring-[#141618]"
          />
        </div>

        {/* 5. Treatment (Free text per PRD §8.6) */}
        <div className="space-y-1.5">
          <label
            htmlFor="treatment"
            className="block text-xs font-bold uppercase tracking-wider text-[#141618]"
          >
            5. Treatment Plan &amp; Patient Management
          </label>
          <Textarea
            id="treatment"
            rows={3}
            {...register("treatment")}
            placeholder="Therapies, patient counseling, safety netting, red flag warnings..."
            className="w-full rounded-none border border-[#141618] bg-[#FAFAF7] p-2 text-xs text-[#141618] focus-visible:ring-1 focus-visible:ring-[#141618]"
          />
        </div>

        {/* 6. Notes (Free text per PRD §8.6) */}
        <div className="space-y-1.5">
          <label
            htmlFor="notes"
            className="block text-xs font-bold uppercase tracking-wider text-[#141618]"
          >
            6. Clinical Notes &amp; Follow-up Advice
          </label>
          <Textarea
            id="notes"
            rows={2}
            {...register("notes")}
            placeholder="Private practice notes, colleague handovers, follow-up timelines..."
            className="w-full rounded-none border border-[#141618] bg-[#FAFAF7] p-2 text-xs text-[#141618] focus-visible:ring-1 focus-visible:ring-[#141618]"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[#D8D4CC]">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="rounded-none border border-[#141618] bg-[#141618] px-5 py-2 text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Save Consultation Record</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
