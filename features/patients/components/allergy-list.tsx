"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClinicalListShell } from "./clinical-list-shell";
import { ClinicalAddDialog } from "./clinical-add-dialog";
import { formatDate } from "@/lib/dates/format";
import type { Allergy } from "@/lib/db/schema";
import { allergySchema } from "@/features/patients/schema";
import {
  addAllergyAction,
  deleteAllergyAction,
} from "@/app/(app)/patients/[id]/actions";

interface AllergyListProps {
  initialAllergies?: Allergy[];
  patientId?: string;
  onAddAllergy?: (allergy: Allergy) => void;
  onDeleteAllergy?: (allergyId: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function AllergyList({
  initialAllergies = [],
  patientId,
  onAddAllergy,
  onDeleteAllergy,
  readOnly = false,
  className,
}: AllergyListProps) {
  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies);
  const [prevInitial, setPrevInitial] = useState<Allergy[]>(initialAllergies);

  // Sync if prop updates (render-time adjustment, avoids setState-in-effect)
  if (initialAllergies !== prevInitial) {
    setPrevInitial(initialAllergies);
    setAllergies(initialAllergies);
  }
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [newSubstance, setNewSubstance] = useState("");
  const [newSeverity, setNewSeverity] = useState<"mild" | "moderate" | "severe">("moderate");
  const [newReaction, setNewReaction] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
      setActionError(null);
      const res = await deleteAllergyAction(allergyId, patientId);
      setDeletingId(null);
      if (!res.success) {
        setActionError(res.error);
        return;
      }
    }

    setAllergies((prev) => prev.filter((a) => a.id !== allergyId));
    onDeleteAllergy?.(allergyId);
  };

  return (
    <>
      <ClinicalListShell
        icon={<AlertTriangle className="size-3.5 text-clinical-critical" />}
        title="Known Allergies & Adverse Reactions"
        count={allergies.length}
        countLabel="RECORDED"
        countBadgeVariant="destructive"
        canAdd={!readOnly}
        onAddClick={() => {
          setFormError(null);
          setIsAddAllergyOpen(true);
        }}
        actionError={actionError}
        emptyMessage="No known allergies recorded"
        isEmpty={allergies.length === 0}
        className={className}
      >
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
                    ? "border-clinical-critical bg-clinical-critical-bg"
                    : isModerate
                    ? "border-clinical-warning bg-clinical-warning-bg"
                    : "border-clinical-resolved bg-clinical-resolved-bg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-xs tracking-tight ${
                      isSevere
                        ? "text-clinical-critical"
                        : isModerate
                        ? "text-clinical-warning"
                        : "text-clinical-resolved"
                    }`}
                  >
                    {allergy.substance}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      role="status"
                      aria-label={`Allergy severity: ${allergy.severity}`}
                      className={`text-[11px] font-mono uppercase px-2 py-0.5 font-bold tracking-wider ${
                        isSevere
                          ? "bg-clinical-critical text-primary-foreground"
                          : isModerate
                          ? "bg-clinical-warning text-primary-foreground"
                          : "bg-clinical-resolved text-primary-foreground"
                      }`}
                    >
                      {allergy.severity}
                    </span>
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isDeleting}
                        onClick={() => handleDeleteAllergy(allergy.id)}
                        className="size-6 p-0 text-text-muted hover:text-clinical-critical hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isDeleting ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                        <span className="sr-only">Delete allergy {allergy.substance}</span>
                      </Button>
                    )}
                  </div>
                </div>
                {allergy.reaction && (
                  <p className="mt-1 text-[11px] leading-tight text-foreground">
                    {allergy.reaction}
                  </p>
                )}
                <span className="mt-1 block text-[11px] font-mono text-text-muted">
                  Recorded: {formatDate(allergy.createdAt, "Clinical Record")}
                </span>
              </div>
            );
          })}
        </div>
      </ClinicalListShell>

      <ClinicalAddDialog
        open={isAddAllergyOpen}
        onOpenChange={setIsAddAllergyOpen}
        title="Record Adverse Reaction / Allergy"
        formError={formError}
        isSubmitting={isSubmitting}
        submitLabel="Save Allergy"
        onSubmit={handleAddAllergy}
      >
        <div>
          <label
            htmlFor="allergy-substance-input"
            className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1"
          >
            Substance / Medication *
          </label>
          <Input
            id="allergy-substance-input"
            type="text"
            required
            value={newSubstance}
            onChange={(e) => setNewSubstance(e.target.value)}
            placeholder="e.g. Amoxicillin, Latex, Peanuts"
            className="rounded-none border border-primary bg-background text-xs font-mono"
          />
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
            Clinical Severity
          </span>
          <div className="flex items-center border border-primary bg-card h-9">
            {(["severe", "moderate", "mild"] as const).map((sev) => {
              const isSelected = newSeverity === sev;
              const activeClass =
                sev === "severe"
                  ? "bg-clinical-critical text-primary-foreground hover:bg-clinical-critical/90"
                  : sev === "moderate"
                  ? "bg-clinical-warning text-primary-foreground hover:bg-clinical-warning/90"
                  : "bg-clinical-resolved text-primary-foreground hover:bg-clinical-resolved/90";

              return (
                <Button
                  key={sev}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewSeverity(sev)}
                  className={`flex-1 rounded-none text-xs font-mono uppercase font-bold h-full ${
                    isSelected ? activeClass : "text-foreground hover:bg-background"
                  }`}
                >
                  {sev}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="allergy-reaction-input"
            className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1"
          >
            Reaction Description
          </label>
          <Input
            id="allergy-reaction-input"
            type="text"
            value={newReaction}
            onChange={(e) => setNewReaction(e.target.value)}
            placeholder="e.g. Anaphylaxis, facial swelling, rash"
            className="rounded-none border border-primary bg-background text-xs font-mono"
          />
        </div>
      </ClinicalAddDialog>
    </>
  );
}
