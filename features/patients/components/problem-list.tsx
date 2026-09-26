"use client";

import React, { useState } from "react";
import { Activity, Plus, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  className?: string;
}

export function ProblemList({
  initialProblems = [],
  patientId,
  onAddProblem,
  onUpdateProblem,
  className,
}: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "resolved">("active");
  const [newOnsetDate, setNewOnsetDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
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
      const res = await updateProblemAction(problem.id, patientId, {
        status: nextStatus,
      });
      setTogglingId(null);

      if (!res.success) {
        alert(res.error);
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
    <section className={`space-y-2.5 ${className || ""}`}>
      <div className="flex items-center justify-between border-b border-[#141618] pb-1">
        <div className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-[#141618]" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#141618]">
            Problem List &amp; Chronic Conditions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5A5D61]">
            {problems.filter((p) => p.status === "active").length} ACTIVE
          </span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setFormError(null);
              setIsAddProblemOpen(true);
            }}
            className="h-5 rounded-none border-[#141618] px-1.5 text-[11px] font-mono uppercase tracking-wider hover:bg-[#141618] hover:text-[#FAFAF7]"
          >
            <Plus className="size-2.5 mr-0.5" />
            Add
          </Button>
        </div>
      </div>

      {problems.length === 0 ? (
        <div className="border border-dashed border-[#D8D4CC] p-3 text-center text-xs font-mono text-[#5A5D61]">
          No active problems recorded
        </div>
      ) : (
        <div className="border border-[#141618] divide-y divide-[#D8D4CC] bg-white">
          {problems.map((problem) => {
            const isActive = problem.status === "active";
            const isToggling = togglingId === problem.id;

            return (
              <div key={problem.id} className="p-2.5 group">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-[#141618]">
                      {problem.condition}
                    </span>
                    {problem.onsetDate && (
                      <span className="block mt-0.5 text-[11px] font-mono text-[#5A5D61]">
                        Onset: {problem.onsetDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      disabled={isToggling}
                      onClick={() => handleToggleStatus(problem)}
                      title={isActive ? "Mark resolved" : "Re-activate"}
                      className={`h-5 text-[11px] font-mono uppercase px-2 py-0 border shrink-0 tracking-wider rounded-none ${
                        isActive
                          ? "border-[#141618] bg-[#141618] text-[#FAFAF7] hover:bg-black"
                          : "border-[#166534] bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7]"
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Document Chronic Condition */}
      <Dialog open={isAddProblemOpen} onOpenChange={setIsAddProblemOpen}>
        <DialogPopup className="max-w-md">
          <DialogHeader className="border-b border-[#141618] pb-3">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-[#141618]">
              Document Chronic Condition / Problem
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddProblem} className="p-4 space-y-4">
            {formError && (
              <div className="border border-[#B91C1C] bg-[#FFF5F5] p-2 text-xs font-mono text-[#B91C1C]">
                {formError}
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                Medical Diagnosis / Problem *
              </label>
              <Input
                type="text"
                required
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g. Essential Hypertension, Asthma"
                className="rounded-none border border-[#141618] bg-[#FAFAF7] text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                  Status
                </label>
                <div className="flex border border-[#141618] bg-white h-9">
                  {(["active", "resolved"] as const).map((st) => (
                    <Button
                      key={st}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewStatus(st)}
                      className={`flex-1 rounded-none text-xs font-mono uppercase font-bold h-full ${
                        newStatus === st
                          ? "bg-[#141618] text-[#FAFAF7]"
                          : "text-[#141618] hover:bg-[#FAFAF7]"
                      }`}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-[#5A5D61] block mb-1">
                  Onset Year / Date
                </label>
                <Input
                  type="text"
                  value={newOnsetDate}
                  onChange={(e) => setNewOnsetDate(e.target.value)}
                  placeholder="e.g. 2021 or 05/2021"
                  className="rounded-none border border-[#141618] bg-[#FAFAF7] text-xs font-mono h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D8D4CC]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setIsAddProblemOpen(false)}
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
                {isSubmitting ? "Saving..." : "Save Problem"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </Dialog>
    </section>
  );
}
