"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pill, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  prescriptionItemSchema,
  type PrescriptionItemInput,
} from "../schema";
import { createPrescriptionAction } from "@/app/patients/[id]/consultations/[consultationId]/actions";
import type { PrescriptionWithItems } from "../queries";

export interface PrescriptionItemDraft {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionFormProps {
  items?: PrescriptionItemDraft[];
  onChange?: (items: PrescriptionItemDraft[]) => void;
  title?: string;
  patientId?: string;
  consultationId?: string;
  onSuccess?: (prescription: PrescriptionWithItems) => void;
}

export function PrescriptionForm({
  items: controlledItems,
  onChange,
  title = "Prescription Items",
  patientId,
  consultationId,
  onSuccess,
}: PrescriptionFormProps) {
  const [internalItems, setInternalItems] = useState<PrescriptionItemDraft[]>([]);
  const items = controlledItems ?? internalItems;

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionItemInput>({
    resolver: zodResolver(prescriptionItemSchema),
    defaultValues: {
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  });

  const updateItems = (newItems: PrescriptionItemDraft[]) => {
    if (onChange) {
      onChange(newItems);
    } else {
      setInternalItems(newItems);
    }
  };

  const handleAddMedication = (data: PrescriptionItemInput) => {
    const newItem: PrescriptionItemDraft = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      medication: data.medication,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      instructions: data.instructions || "",
    };

    updateItems([...items, newItem]);
    reset();
    setServerError(null);
  };

  const handleRemoveMedication = (itemId: string) => {
    updateItems(items.filter((item) => item.id !== itemId));
  };

  const handleDirectSubmit = async () => {
    if (!patientId || !consultationId) return;
    if (items.length === 0) {
      setServerError("Please add at least one medication item before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);

      const payload = {
        consultationId,
        items: items.map((it) => ({
          medication: it.medication,
          dosage: it.dosage,
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions || null,
        })),
      };

      const result = await createPrescriptionAction(
        patientId,
        consultationId,
        payload
      );

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      setServerSuccess(true);
      updateItems([]);
      setIsOpen(false);
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to create prescription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-none border border-[#141618] bg-white p-5 sm:p-6 shadow-[2px_2px_0px_#141618]">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between border-b border-[#141618]">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-[#141618]" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#141618]">
            {title}
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[11px] rounded-none">
            {items.length} item{items.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => {
            setIsOpen(!isOpen);
            setServerSuccess(false);
          }}
          className="rounded-none border border-[#141618] text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7]"
        >
          {isOpen ? "Close Pad" : "+ Add Medication Item"}
        </Button>
      </CardHeader>

      <CardContent className="p-0 pt-4 space-y-4">
        {serverSuccess && (
          <div className="flex items-center gap-2 border border-[#166534] bg-[#F0FDF4] p-3 text-xs font-mono text-[#166534]">
            <CheckCircle2 className="size-4" />
            <span>Prescription issued successfully and attached to consultation record.</span>
          </div>
        )}

        {serverError && (
          <div className="border border-[#B91C1C] bg-[#FEF2F2] p-3 text-xs font-mono text-[#B91C1C]">
            {serverError}
          </div>
        )}

        {/* Dynamic Item Form */}
        {isOpen && (
          <form
            onSubmit={handleSubmit(handleAddMedication)}
            className="border border-[#141618] bg-[#FAFAF7] p-4 space-y-4"
          >
            <span className="text-[11px] font-mono uppercase text-[#5A5D61] font-bold block">
              Add Prescription Line Item
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                  Medication &amp; Form *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg caps"
                  {...register("medication")}
                  className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
                />
                {errors.medication && (
                  <span className="text-[10px] text-[#B91C1C] font-mono mt-1 block">
                    {errors.medication.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                  Dosage *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 500mg"
                  {...register("dosage")}
                  className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
                />
                {errors.dosage && (
                  <span className="text-[10px] text-[#B91C1C] font-mono mt-1 block">
                    {errors.dosage.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                  Frequency *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Three times daily"
                  {...register("frequency")}
                  className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
                />
                {errors.frequency && (
                  <span className="text-[10px] text-[#B91C1C] font-mono mt-1 block">
                    {errors.frequency.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                  Duration / Qty *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 7 days (21 capsules)"
                  {...register("duration")}
                  className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
                />
                {errors.duration && (
                  <span className="text-[10px] text-[#B91C1C] font-mono mt-1 block">
                    {errors.duration.message}
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                  Patient Instructions / Advice
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Take with food. Complete the full antibiotic course."
                  {...register("instructions")}
                  className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="default"
                size="xs"
                className="rounded-none border border-[#141618] bg-[#141618] text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1"
              >
                <Plus className="size-3" />
                <span>Add Item to List</span>
              </Button>
            </div>
          </form>
        )}

        {/* Configured Items List */}
        {items.length === 0 ? (
          <div className="border border-dashed border-[#D8D4CC] p-4 text-center text-xs font-mono text-[#5A5D61]">
            No medication items added to this prescription yet.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-[#141618] bg-[#FAFAF7] p-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#5A5D61] text-[11px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-[#141618]">{item.medication}</span>
                    <span className="font-mono text-[11px] text-[#5A5D61]">
                      ({item.dosage})
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#5A5D61]">
                    <span>{item.frequency}</span> • <span>{item.duration}</span>
                    {item.instructions && (
                      <>
                        {" "}— <span className="italic">{item.instructions}</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => handleRemoveMedication(item.id)}
                  className="text-[#B91C1C] hover:bg-[#FFF5F5] rounded-none size-7 p-0"
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Direct Submit Action (when attached to existing encounter) */}
        {patientId && consultationId && items.length > 0 && (
          <div className="flex justify-end pt-2 border-t border-[#141618]">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDirectSubmit}
              disabled={isSubmitting}
              className="rounded-none border border-[#141618] bg-[#141618] px-4 py-1.5 text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black"
            >
              {isSubmitting ? "Issuing Prescription..." : "Issue & Save Prescription Order"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
