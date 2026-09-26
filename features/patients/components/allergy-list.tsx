"use client";

import React, { useState } from "react";
import { AlertTriangle, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Allergy } from "@/lib/db/schema";
import { allergySchema } from "@/features/patients/schema";
import {
  addAllergyAction,
  deleteAllergyAction,
} from "@/app/patients/[id]/actions";

interface AllergyListProps {
  initialAllergies?: Allergy[];
  patientId?: string;
  onAddAllergy?: (allergy: Allergy) => void;
  onDeleteAllergy?: (allergyId: string) => void;
  className?: string;
}

export function AllergyList({
  initialAllergies = [],
  patientId,
  onAddAllergy,
  onDeleteAllergy,
  className,
}: AllergyListProps) {
  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [newSubstance, setNewSubstance] = useState("");
  const [newSeverity, setNewSeverity] = useState<"mild" | "moderate" | "severe">("moderate");
  const [newReaction, setNewReaction] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = allergySchema.safeParse({
      substance: newSubstance,
      severity: newSeverity,
      reaction: newReaction,
    });

    if (!validation.success) {
      setFormError(validation.error.issues.map((i) => i.message).join(", "));
      return;
    }

    if (patientId) {
      setIsSubmitting(true);
      const res = await addAllergyAction(patientId, validation.data);
      setIsSubmitting(false);

      if (!res.success) {
        setFormError(res.error);
        return;
      }

      setAllergies((prev) => [res.data, ...prev]);
      onAddAllergy?.(res.data);
    } else {
      const localEntry: Allergy = {
        id: `alg-${Date.now()}`,
        patientId: patientId || "local",
        substance: validation.data.substance,
        severity: validation.data.severity,
        reaction: validation.data.reaction ?? null,
        createdAt: new Date(),
      };
      setAllergies((prev) => [localEntry, ...prev]);
      onAddAllergy?.(localEntry);
    }

    setNewSubstance("");
    setNewSeverity("moderate");
    setNewReaction("");
    setIsAddAllergyOpen(false);
  };

  const handleDeleteAllergy = async (allergyId: string) => {
    if (patientId) {
      setDeletingId(allergyId);
      const res = await deleteAllergyAction(allergyId, patientId);
      setDeletingId(null);
      if (!res.success) {
        alert(res.error);
        return;
      }
    }

    setAllergies((prev) => prev.filter((a) => a.id !== allergyId));
    onDeleteAllergy?.(allergyId);
  };

  return (
    <section className={`space-y-2.5 ${className || ""}`}>
      <div className="flex items-center justify-between border-b border-[#141618] pb-1">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 text-[#B91C1C]" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#141618]">
            Known Allergies &amp; Adverse Reactions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#B91C1C] font-semibold">
            {allergies.length} RECORDED
          </span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setFormError(null);
              setIsAddAllergyOpen(true);
            }}
            className="h-5 rounded-none border-[#141618] px-1.5 text-[11px] font-mono uppercase tracking-wider hover:bg-[#141618] hover:text-[#FAFAF7]"
          >
            <Plus className="size-2.5 mr-0.5" />
            Log
          </Button>
        </div>
      </div>

      {allergies.length === 0 ? (
        <div className="border border-dashed border-[#D8D4CC] p-3 text-center text-xs font-mono text-[#5A5D61]">
          No known allergies recorded
        </div>
      ) : (
        <div className="space-y-2">
          {allergies.map((allergy) => {
            const isSevere = allergy.severity === "severe";
            const isModerate = allergy.severity === "moderate";
            const isDeleting = deletingId === allergy.id;

            return (
              <div
                key={allergy.id}
                className={`group relative border p-2.5 transition-colors ${
                  isSevere
                    ? "border-[#B91C1C] bg-[#FFF5F5]"
                    : isModerate
                    ? "border-[#D97706] bg-[#FFFDF5]"
                    : "border-[#166534] bg-[#F0FDF4]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-xs tracking-tight ${
                      isSevere
                        ? "text-[#B91C1C]"
                        : isModerate
                        ? "text-[#92400E]"
                        : "text-[#166534]"
                    }`}
                  >
                    {allergy.substance}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-mono uppercase px-2 py-0.5 font-bold tracking-wider ${
                        isSevere
                          ? "bg-[#B91C1C] text-[#FAFAF7]"
                          : isModerate
                          ? "bg-[#D97706] text-[#FAFAF7]"
                          : "bg-[#166534] text-[#FAFAF7]"
                      }`}
                    >
                      {allergy.severity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      disabled={isDeleting}
                      onClick={() => handleDeleteAllergy(allergy.id)}
                      className="size-6 p-0 text-[#5A5D61] hover:text-[#B91C1C] hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      <span className="sr-only">Delete allergy</span>
                    </Button>
                  </div>
                </div>
                {allergy.reaction && (
                  <p className="mt-1 text-[11px] leading-tight text-[#141618]">
                    {allergy.reaction}
                  </p>
                )}
                <span className="mt-1 block text-[11px] font-mono text-[#5A5D61]">
                  Recorded:{" "}
                  {allergy.createdAt instanceof Date
                    ? allergy.createdAt.toLocaleDateString("en-GB")
                    : String(allergy.createdAt || "Clinical Record")}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Log New Allergy */}
      <Dialog open={isAddAllergyOpen} onOpenChange={setIsAddAllergyOpen}>
        <DialogPopup className="max-w-md">
          <DialogHeader className="border-b border-[#141618] pb-3">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-[#141618]">
              Record Adverse Reaction / Allergy
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddAllergy} className="p-4 space-y-4">
            {formError && (
              <div className="border border-[#B91C1C] bg-[#FFF5F5] p-2 text-xs font-mono text-[#B91C1C]">
                {formError}
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                Substance / Medication *
              </label>
              <Input
                type="text"
                required
                value={newSubstance}
                onChange={(e) => setNewSubstance(e.target.value)}
                placeholder="e.g. Amoxicillin, Latex, Peanuts"
                className="rounded-none border border-[#141618] bg-[#FAFAF7] text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                Clinical Severity
              </label>
              <div className="flex items-center border border-[#141618] bg-white h-9">
                {(["severe", "moderate", "mild"] as const).map((sev) => {
                  const isSelected = newSeverity === sev;
                  const activeClass =
                    sev === "severe"
                      ? "bg-[#B91C1C] text-[#FFF5F5] hover:bg-[#991B1B]"
                      : sev === "moderate"
                      ? "bg-[#D97706] text-[#FFFDF5] hover:bg-[#B45309]"
                      : "bg-[#166534] text-[#F0FDF4] hover:bg-[#15803D]";

                  return (
                    <Button
                      key={sev}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewSeverity(sev)}
                      className={`flex-1 rounded-none text-xs font-mono uppercase font-bold h-full ${
                        isSelected ? activeClass : "text-[#141618] hover:bg-[#FAFAF7]"
                      }`}
                    >
                      {sev}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                Reaction Description
              </label>
              <Input
                type="text"
                value={newReaction}
                onChange={(e) => setNewReaction(e.target.value)}
                placeholder="e.g. Anaphylaxis, facial swelling, rash"
                className="rounded-none border border-[#141618] bg-[#FAFAF7] text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D8D4CC]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setIsAddAllergyOpen(false)}
                className="rounded-none border border-[#141618] text-xs font-mono uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="rounded-none border border-[#141618] bg-[#141618] text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black"
              >
                {isSubmitting ? "Saving..." : "Save Allergy"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </Dialog>
    </section>
  );
}
