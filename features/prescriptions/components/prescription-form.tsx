"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pill, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
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
import { createPrescriptionAction } from "../actions";
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
      id: `item-${crypto.randomUUID()}`,
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

      const result = await createPrescriptionAction(patientId, payload);

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
    <Card className="rounded-none border border-primary bg-card p-5 sm:p-6 shadow-[2px_2px_0px_var(--color-primary)]">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between border-b border-primary">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-foreground" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
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
          className="rounded-none border border-primary text-xs font-mono uppercase font-bold text-foreground hover:bg-background"
        >
          {isOpen ? "Close Pad" : "+ Add Medication Item"}
        </Button>
      </CardHeader>

      <CardContent className="p-0 pt-4 space-y-4">
        {serverSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 border border-clinical-resolved bg-clinical-resolved-bg p-3 text-xs font-mono text-clinical-resolved"
          >
            <CheckCircle2 className="size-4" />
            <span>Prescription issued successfully and attached to consultation record.</span>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            aria-live="polite"
            className="border border-clinical-critical bg-clinical-critical-bg p-3 text-xs font-mono text-clinical-critical"
          >
            {serverError}
          </div>
        )}

        {/* Dynamic Item Form */}
        {isOpen && (
          <form
            onSubmit={handleSubmit(handleAddMedication)}
            className="border border-primary bg-background p-4 space-y-4"
          >
            <span className="text-[11px] font-mono uppercase text-text-muted font-bold block">
              Add Prescription Line Item
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="rx-medication" className="block text-[10px] font-mono uppercase text-text-muted font-bold mb-1">
                  Medication &amp; Form *
                </label>
                <Input
                  id="rx-medication"
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg caps"
                  {...register("medication")}
                  className="w-full rounded-none border border-primary bg-card p-1.5 text-xs text-foreground"
                />
                {errors.medication && (
                  <span className="text-[10px] text-clinical-critical font-mono mt-1 block">
                    {errors.medication.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="rx-dosage" className="block text-[10px] font-mono uppercase text-text-muted font-bold mb-1">
                  Dosage *
                </label>
                <Input
                  id="rx-dosage"
                  type="text"
                  placeholder="e.g. 500mg"
                  {...register("dosage")}
                  className="w-full rounded-none border border-primary bg-card p-1.5 text-xs text-foreground"
                />
                {errors.dosage && (
                  <span className="text-[10px] text-clinical-critical font-mono mt-1 block">
                    {errors.dosage.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="rx-frequency" className="block text-[10px] font-mono uppercase text-text-muted font-bold mb-1">
                  Frequency *
                </label>
                <Input
                  id="rx-frequency"
                  type="text"
                  placeholder="e.g. Three times daily"
                  {...register("frequency")}
                  className="w-full rounded-none border border-primary bg-card p-1.5 text-xs text-foreground"
                />
                {errors.frequency && (
                  <span className="text-[10px] text-clinical-critical font-mono mt-1 block">
                    {errors.frequency.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="rx-duration" className="block text-[10px] font-mono uppercase text-text-muted font-bold mb-1">
                  Duration / Qty *
                </label>
                <Input
                  id="rx-duration"
                  type="text"
                  placeholder="e.g. 7 days (21 capsules)"
                  {...register("duration")}
                  className="w-full rounded-none border border-primary bg-card p-1.5 text-xs text-foreground"
                />
                {errors.duration && (
                  <span className="text-[10px] text-clinical-critical font-mono mt-1 block">
                    {errors.duration.message}
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="rx-instructions" className="block text-[10px] font-mono uppercase text-text-muted font-bold mb-1">
                  Patient Instructions / Advice
                </label>
                <Input
                  id="rx-instructions"
                  type="text"
                  placeholder="e.g. Take with food. Complete the full antibiotic course."
                  {...register("instructions")}
                  className="w-full rounded-none border border-primary bg-card p-1.5 text-xs text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="default"
                size="xs"
                className="rounded-none border border-primary bg-primary text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-black flex items-center gap-1"
              >
                <Plus className="size-3" />
                <span>Add Item to List</span>
              </Button>
            </div>
          </form>
        )}

        {/* Configured Items List */}
        {items.length === 0 ? (
          <div className="border border-dashed border-neutral-border p-4 text-center text-xs font-mono text-text-muted">
            No medication items added to this prescription yet.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-primary bg-background p-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-muted text-[11px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-foreground">{item.medication}</span>
                    <span className="font-mono text-[11px] text-text-muted">
                      ({item.dosage})
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-text-muted">
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
                  className="text-clinical-critical hover:bg-clinical-critical-bg rounded-none size-7 p-0"
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Draft Items Indicator (when creating new consultation) */}
        {!consultationId && items.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-primary text-xs font-mono text-text-muted">
            <span>{items.length} medication {items.length === 1 ? "item" : "items"} attached</span>
            <span className="text-foreground font-semibold">Saved with consultation record</span>
          </div>
        )}

        {/* Direct Submit Action (when attached to existing encounter) */}
        {patientId && consultationId && items.length > 0 && (
          <div className="flex justify-end pt-2 border-t border-primary">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDirectSubmit}
              disabled={isSubmitting}
              className="rounded-none border border-primary bg-primary px-4 py-1.5 text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-black flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Issuing Prescription...</span>
                </>
              ) : (
                <span>Issue &amp; Save Prescription Order</span>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
