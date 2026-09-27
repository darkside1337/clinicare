"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Home, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { patientSchema, type PatientInput } from "@/features/patients/schema";
import { createPatientAction } from "@/app/(app)/patients/actions";
import { updatePatientAction } from "@/app/(app)/patients/[id]/actions";
import type { Patient } from "@/lib/db/schema";

interface PatientFormProps {
  initialData?: Partial<PatientInput>;
  patientId?: string;
  onSuccess?: (patient: Patient) => void;
  onSubmit?: (data: PatientInput) => void;
  isSubmitting?: boolean;
}

import { calculateAge } from "@/lib/dates/calculate-age";

export function PatientForm({
  initialData,
  patientId,
  onSuccess,
  onSubmit: externalOnSubmit,
  isSubmitting: externalSubmitting,
}: PatientFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name || "",
      dob: initialData?.dob || "",
      sex: initialData?.sex || "Female",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
    },
  });

  const isSubmitting = externalSubmitting ?? formSubmitting;
  const watchedDob = useWatch({ control, name: "dob" });
  const watchedSex = useWatch({ control, name: "sex" });
  const calculatedAge = calculateAge(watchedDob);

  const handleFormSubmit = async (data: PatientInput) => {
    setServerError(null);

    if (externalOnSubmit) {
      externalOnSubmit(data);
      return;
    }

    try {
      if (patientId) {
        const result = await updatePatientAction(patientId, data);
        if (!result.success) {
          setServerError(result.error);
          return;
        }
        onSuccess?.(result.data);
        router.push(`/patients/${patientId}`);
      } else {
        const result = await createPatientAction(data);
        if (!result.success) {
          setServerError(result.error);
          return;
        }
        onSuccess?.(result.data);
        router.push(`/patients/${result.data.id}`);
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormErrorAlert message={serverError} />

      {/* SECTION 1: Patient Demographics */}
      <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <User className="size-3.5 text-foreground" />
            <span>1. Primary Demographics</span>
          </h2>
          <span className="text-[11px] font-mono text-text-muted">
            * MANDATORY FIELDS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="patient-name" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
              Full Patient Name *
            </label>
            <Input
              id="patient-name"
              type="text"
              {...register("name")}
              placeholder="e.g. Eleanor Vance-Croft"
              className={`rounded-none border bg-background text-xs font-mono ${
                errors.name ? "border-clinical-critical" : "border-primary"
              }`}
            />
            {errors.name && (
              <span role="alert" className="text-[11px] font-mono text-clinical-critical mt-1 block">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="patient-dob" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
              Date of Birth (DD/MM/YYYY or YYYY-MM-DD) *
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="patient-dob"
                type="text"
                {...register("dob")}
                placeholder="14/08/1985"
                className={`rounded-none border bg-background text-xs font-mono ${
                  errors.dob ? "border-clinical-critical" : "border-primary"
                }`}
              />
              {calculatedAge !== null && (
                <span className="border border-primary bg-background px-2 py-1 text-[11px] font-mono font-bold shrink-0">
                  {calculatedAge} YRS
                </span>
              )}
            </div>
            {errors.dob && (
              <span role="alert" className="text-[11px] font-mono text-clinical-critical mt-1 block">
                {errors.dob.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
              Biological Sex *
            </label>
            <div className="flex items-center border border-primary bg-card h-9">
              {(["Female", "Male", "Other"] as const).map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("sex", s, { shouldValidate: true })}
                  className={`flex-1 rounded-none text-xs font-mono uppercase font-bold h-full ${
                    watchedSex === s
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-text-muted hover:bg-muted"
                  }`}
                >
                  {s}
                </Button>
              ))}
            </div>
            {errors.sex && (
              <span role="alert" className="text-[11px] font-mono text-clinical-critical mt-1 block">
                {errors.sex.message}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Contact Information */}
      <section className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-border pb-1.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Home className="size-3.5 text-foreground" />
            <span>2. Contact &amp; Residential Information</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patient-phone" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
              Primary Telephone Number
            </label>
            <Input
              id="patient-phone"
              type="tel"
              {...register("phone")}
              placeholder="+44 7700 900000"
              className={`rounded-none border bg-background text-xs font-mono ${
                errors.phone ? "border-clinical-critical" : "border-primary"
              }`}
            />
            {errors.phone && (
              <span role="alert" className="text-[11px] font-mono text-clinical-critical mt-1 block">
                {errors.phone.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="patient-email" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
              Email Address
            </label>
            <Input
              id="patient-email"
              type="email"
              {...register("email")}
              placeholder="patient@example.com"
              className={`rounded-none border bg-background text-xs font-mono ${
                errors.email ? "border-clinical-critical" : "border-primary"
              }`}
            />
            {errors.email && (
              <span role="alert" className="text-[11px] font-mono text-clinical-critical mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="patient-address" className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
              Residential Address / Postcode
            </label>
            <Input
              id="patient-address"
              type="text"
              {...register("address")}
              placeholder="e.g. 14 Kensington Gardens, London W8 4PX"
              className="rounded-none border border-primary bg-background text-xs font-mono"
            />
          </div>
        </div>
      </section>

      {/* Form Submission Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-none border border-primary bg-card px-5 py-2 text-xs font-mono uppercase font-bold text-foreground hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-none border border-primary bg-primary px-6 py-2 text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
              <span>Registering Record...</span>
            </>
          ) : (
            <>
              <Save className="size-3.5 mr-1.5" />
              <span>{patientId ? "Save Patient Changes" : "Save Clinical Record"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
