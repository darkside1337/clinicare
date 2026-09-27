"use client";

import React, { useState } from "react";
import { Activity, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClinicalListShell } from "./clinical-list-shell";
import { ClinicalAddDialog } from "./clinical-add-dialog";
import type { Problem } from "@/lib/db/schema";
import { problemSchema } from "@/features/patients/schema";
import {
  addProblemAction,
  updateProblemAction,
} from "@/app/(app)/patients/[id]/actions";

interface ProblemListProps {
  initialProblems?: Problem[];
  patientId?: string;
  onAddProblem?: (problem: Problem) => void;
  onUpdateProblem?: (problem: Problem) => void;
  readOnly?: boolean;
  className?: string;
}

export function ProblemList({
  initialProblems = [],
  patientId,
  onAddProblem,
  onUpdateProblem,
  readOnly = false,
  className,
}: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [prevInitial, setPrevInitial] = useState<Problem[]>(initialProblems);

  // Sync if prop updates (render-time adjustment, avoids setState-in-effect)
  if (initialProblems !== prevInitial) {
    setPrevInitial(initialProblems);
    setProblems(initialProblems);
  }
  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "resolved">("active");
  const [newOnsetDate, setNewOnsetDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = problemSchema.safeParse({
      condition: newCondition,
      status: newStatus,
      onsetDate: newOnsetDate,
    });

    if (!validation.success) {
      setFormError(validation.error.issues.map((i) => i.message).join(", "));
      return;
    }

    if (patientId) {
      setIsSubmitting(true);
      const res = await addProblemAction(patientId, validation.data);
      setIsSubmitting(false);

      if (!res.success) {
        setFormError(res.error);
        return;
      }

      setProblems((prev) => [res.data, ...prev]);
      onAddProblem?.(res.data);
    } else {
      const localEntry: Problem = {
        id: `prb-${Date.now()}`,
        patientId: patientId || "local",
        condition: validation.data.condition,
        status: validation.data.status,
        onsetDate: validation.data.onsetDate ?? null,
        createdAt: new Date(),
      };
      setProblems((prev) => [localEntry, ...prev]);
      onAddProblem?.(localEntry);
    }

    setNewCondition("");
    setNewStatus("active");
    setNewOnsetDate("");
    setIsAddProblemOpen(false);
  };

  const handleToggleStatus = async (problem: Problem) => {
    const nextStatus = problem.status === "active" ? "resolved" : "active";

    if (patientId) {
      setTogglingId(problem.id);
      setActionError(null);
      const res = await updateProblemAction(problem.id, patientId, {
        status: nextStatus,
      });
      setTogglingId(null);

      if (!res.success) {
        setActionError(res.error);
        return;
      }

      setProblems((prev) =>
        prev.map((p) => (p.id === problem.id ? res.data : p))
      );
      onUpdateProblem?.(res.data);
    } else {
      const updated = { ...problem, status: nextStatus as "active" | "resolved" };
      setProblems((prev) =>
        prev.map((p) => (p.id === problem.id ? updated : p))
      );
      onUpdateProblem?.(updated);
    }
  };

  return (
    <>
      <ClinicalListShell
        icon={<Activity className="size-3.5 text-foreground" />}
        title="Problem List & Chronic Conditions"
        count={problems.filter((p) => p.status === "active").length}
        countLabel="ACTIVE"
        canAdd={!readOnly}
        onAddClick={() => {
          setFormError(null);
          setIsAddProblemOpen(true);
        }}
        actionError={actionError}
        emptyMessage="No active problems recorded"
        isEmpty={problems.length === 0}
        className={className}
      >
        <div className="border border-primary divide-y divide-neutral-border bg-card">
          {problems.map((problem) => {
            const isActive = problem.status === "active";
            const isToggling = togglingId === problem.id;

            return (
              <div key={problem.id} className="p-2.5 group">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-foreground">
                      {problem.condition}
                    </span>
                    {problem.onsetDate && (
                      <span className="block mt-0.5 text-[11px] font-mono text-text-muted">
                        Onset: {problem.onsetDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {readOnly ? (
                      <span
                        className={`h-5 text-[11px] font-mono uppercase px-2 py-0 border shrink-0 tracking-wider flex items-center ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-clinical-resolved bg-clinical-resolved-bg text-clinical-resolved"
                        }`}
                      >
                        {isActive ? (
                          <Activity className="size-2.5 mr-1" />
                        ) : (
                          <CheckCircle2 className="size-2.5 mr-1" />
                        )}
                        <span>{problem.status}</span>
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isToggling}
                        onClick={() => handleToggleStatus(problem)}
                        title={isActive ? "Mark resolved" : "Re-activate"}
                        aria-label={`Status: ${problem.status}. Click to toggle.`}
                        className={`h-5 text-[11px] font-mono uppercase px-2 py-0 border shrink-0 tracking-wider rounded-none ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground hover:bg-black"
                            : "border-clinical-resolved bg-clinical-resolved-bg text-clinical-resolved hover:bg-clinical-resolved-bg/80"
                        }`}
                      >
                        {isToggling ? (
                          <RefreshCw className="size-2.5 animate-spin mr-1" />
                        ) : isActive ? (
                          <Activity className="size-2.5 mr-1" />
                        ) : (
                          <CheckCircle2 className="size-2.5 mr-1" />
                        )}
                        <span>{problem.status}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ClinicalListShell>

      <ClinicalAddDialog
        open={isAddProblemOpen}
        onOpenChange={setIsAddProblemOpen}
        title="Document Chronic Condition / Problem"
        formError={formError}
        isSubmitting={isSubmitting}
        submitLabel="Save Problem"
        onSubmit={handleAddProblem}
      >
        <div>
          <label
            htmlFor="problem-condition-input"
            className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1"
          >
            Medical Diagnosis / Problem *
          </label>
          <Input
            id="problem-condition-input"
            type="text"
            required
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="e.g. Essential Hypertension, Asthma"
            className="rounded-none border border-primary bg-background text-xs font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1">
              Status
            </span>
            <div className="flex border border-primary bg-card h-9">
              {(["active", "resolved"] as const).map((st) => (
                <Button
                  key={st}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewStatus(st)}
                  className={`flex-1 rounded-none text-xs font-mono uppercase font-bold h-full ${
                    newStatus === st
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-background"
                  }`}
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="problem-onset-input"
              className="text-[11px] font-mono uppercase font-bold text-text-muted block mb-1"
            >
              Onset Year / Date
            </label>
            <Input
              id="problem-onset-input"
              type="text"
              value={newOnsetDate}
              onChange={(e) => setNewOnsetDate(e.target.value)}
              placeholder="e.g. 2021 or 05/2021"
              className="rounded-none border border-primary bg-background text-xs font-mono h-9"
            />
          </div>
        </div>
      </ClinicalAddDialog>
    </>
  );
}
