"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Home, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patientSchema, type PatientInput } from "@/features/patients/schema";
import { createPatientAction } from "@/app/patients/actions";
import { updatePatientAction } from "@/app/patients/[id]/actions";
import type { Patient } from "@/lib/db/schema";

interface PatientFormProps {
  initialData?: Partial<PatientInput>;
  patientId?: string;
  onSuccess?: (patient: Patient) => void;
  onSubmit?: (data: PatientInput) => void;
  isSubmitting?: boolean;
}

function calculateAge(val: string): number | null {
  if (!val) return null;
  const parts = val.split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const birthDate = new Date(year, month, day);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0 && age < 125) return age;
    }
  }

  const isoParts = val.split("-");
  if (isoParts.length === 3 && isoParts[0].length === 4) {
    const year = parseInt(isoParts[0], 10);
    const month = parseInt(isoParts[1], 10) - 1;
    const day = parseInt(isoParts[2], 10);
    const birthDate = new Date(year, month, day);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0 && age < 125) return age;
    }
  }

  return null;
}

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
    watch,
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
  const watchedDob = watch("dob");
  const watchedSex = watch("sex");
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
      {serverError && (
        <div className="border border-[#B91C1C] bg-[#FFF5F5] p-3 text-xs font-mono text-[#B91C1C] flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* SECTION 1: Patient Demographics */}
      <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618] flex items-center gap-1.5">
            <User className="size-3.5 text-[#141618]" />
            <span>1. Primary Demographics</span>
          </h2>
          <span className="text-[11px] font-mono text-[#5A5D61]">
            * MANDATORY FIELDS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
              Full Patient Name *
            </label>
            <Input
              type="text"
              {...register("name")}
              placeholder="e.g. Eleanor Vance-Croft"
              className={`rounded-none border bg-[#FAFAF7] text-xs font-mono ${
                errors.name ? "border-[#B91C1C]" : "border-[#141618]"
              }`}
            />
            {errors.name && (
              <span className="text-[11px] font-mono text-[#B91C1C] mt-1 block">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
              Date of Birth (DD/MM/YYYY or YYYY-MM-DD) *
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                {...register("dob")}
                placeholder="14/08/1985"
                className={`rounded-none border bg-[#FAFAF7] text-xs font-mono ${
                  errors.dob ? "border-[#B91C1C]" : "border-[#141618]"
                }`}
              />
              {calculatedAge !== null && (
                <span className="border border-[#141618] bg-[#FAFAF7] px-2 py-1 text-[11px] font-mono font-bold shrink-0">
                  {calculatedAge} YRS
                </span>
              )}
            </div>
            {errors.dob && (
              <span className="text-[11px] font-mono text-[#B91C1C] mt-1 block">
                {errors.dob.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
              Biological Sex *
            </label>
            <div className="flex items-center border border-[#141618] bg-white h-9">
              {(["Female", "Male", "Other"] as const).map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("sex", s, { shouldValidate: true })}
                  className={`flex-1 rounded-none text-xs font-mono uppercase font-bold h-full ${
                    watchedSex === s
                      ? "bg-[#141618] text-[#FAFAF7] hover:bg-black hover:text-[#FAFAF7]"
                      : "text-[#5A5D61] hover:bg-[#FAFAF7]"
                  }`}
                >
                  {s}
                </Button>
              ))}
            </div>
            {errors.sex && (
              <span className="text-[11px] font-mono text-[#B91C1C] mt-1 block">
                {errors.sex.message}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Contact Information */}
      <section className="border border-[#141618] bg-white p-5 shadow-[1px_1px_0px_#141618] space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-1.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#141618] flex items-center gap-1.5">
            <Home className="size-3.5 text-[#141618]" />
            <span>2. Contact &amp; Residential Information</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
              Primary Telephone Number
            </label>
            <Input
              type="tel"
              {...register("phone")}
              placeholder="+44 7700 900000"
              className={`rounded-none border bg-[#FAFAF7] text-xs font-mono ${
                errors.phone ? "border-[#B91C1C]" : "border-[#141618]"
              }`}
            />
            {errors.phone && (
              <span className="text-[11px] font-mono text-[#B91C1C] mt-1 block">
                {errors.phone.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
              Email Address
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="patient@example.com"
              className={`rounded-none border bg-[#FAFAF7] text-xs font-mono ${
                errors.email ? "border-[#B91C1C]" : "border-[#141618]"
              }`}
            />
            {errors.email && (
              <span className="text-[11px] font-mono text-[#B91C1C] mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
              Residential Address / Postcode
            </label>
            <Input
              type="text"
              {...register("address")}
              placeholder="e.g. 14 Kensington Gardens, London W8 4PX"
              className="rounded-none border border-[#141618] bg-[#FAFAF7] text-xs font-mono"
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
          className="w-full sm:w-auto rounded-none border border-[#141618] bg-white px-5 py-2 text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-none border border-[#141618] bg-[#141618] px-6 py-2 text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black transition-colors"
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
