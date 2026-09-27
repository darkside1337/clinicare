"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pill, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDate, formatTime } from "@/lib/dates/format";

export interface ConsultationCardItem {
  id: string;
  chiefComplaint: string | null;
  symptoms?: string | null;
  observations?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  createdAt?: Date | string;
  date?: string;
  time?: string;
  doctorName?: string;
  type?: "Scheduled" | "Walk-in" | "Walk-In";
  hasPrescription?: boolean;
  prescriptionCount?: number;
  prescriptionId?: string;
  appointment?: {
    isWalkIn?: boolean;
    scheduledAt?: Date | string;
    status?: string;
  };
}

export interface ConsultationCardProps {
  consultation: ConsultationCardItem;
  patientId: string;
  defaultExpanded?: boolean;
}

function formatConsultationDateTime(consultation: {
  createdAt?: Date | string;
  date?: string;
  time?: string;
}): { date: string; time: string } {
  if (consultation.date && consultation.time) {
    return { date: consultation.date, time: consultation.time };
  }
  if (!consultation.createdAt) {
    return { date: "—", time: "—" };
  }
  return {
    date: formatDate(consultation.createdAt),
    time: formatTime(consultation.createdAt),
  };
}

export function ConsultationCard({
  consultation,
  patientId,
  defaultExpanded = false,
}: ConsultationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { date, time } = formatConsultationDateTime(consultation);
  const encounterType =
    consultation.type ||
    (consultation.appointment?.isWalkIn ? "Walk-In" : "Scheduled");
  const hasPrescription =
    consultation.hasPrescription || Boolean(consultation.prescriptionId);

  return (
    <article className="border border-primary bg-card shadow-[1px_1px_0px_var(--color-primary)] transition-shadow">
      {/* Header Banner */}
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full text-left items-center justify-between border-b border-primary bg-muted/40 px-4 py-2.5 hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-mono text-xs font-bold text-foreground">
            {date} • {time}
          </span>
          <Badge
            variant="outline"
            className="rounded-none border-primary bg-card px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-foreground"
          >
            {encounterType}
          </Badge>
          <span className="text-xs text-text-muted">
            Clinician:{" "}
            <strong className="text-foreground font-medium">
              {consultation.doctorName || "Attending Doctor"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-text-muted hidden sm:inline">
            REF: {consultation.id.slice(0, 8)}
          </span>
          <ChevronRight
            className={`size-4 text-foreground transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Summary View */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
              Chief Complaint
            </span>
            <p className="text-xs font-semibold text-foreground mt-0.5">
              {consultation.chiefComplaint || "—"}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
              Primary Diagnosis
            </span>
            <p className="text-xs font-semibold text-foreground mt-0.5">
              {consultation.diagnosis || "Under clinical evaluation"}
            </p>
          </div>
        </div>

        {/* Expanded Clinical Narrative */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral-border space-y-4">
            {consultation.symptoms && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Symptoms &amp; History
                </span>
                <p className="text-xs text-foreground leading-relaxed mt-0.5">
                  {consultation.symptoms}
                </p>
              </div>
            )}

            {consultation.observations && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Clinical Observations
                </span>
                <div className="mt-0.5 border border-primary bg-background p-2.5 font-mono text-xs text-foreground">
                  {consultation.observations}
                </div>
              </div>
            )}

            {consultation.treatment && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Treatment &amp; Management Plan
                </span>
                <p className="text-xs text-foreground leading-relaxed mt-0.5">
                  {consultation.treatment}
                </p>
              </div>
            )}

            {consultation.notes && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Clinical Notes
                </span>
                <p className="text-xs text-foreground leading-relaxed mt-0.5 italic">
                  {consultation.notes}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-border/60">
              {hasPrescription ? (
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <Pill className="size-3.5 text-foreground" />
                  <span>
                    Prescription attached ({consultation.prescriptionCount || 1})
                  </span>
                </div>
              ) : (
                <div />
              )}

              <Button
                asChild
                variant="outline"
                size="xs"
                className="rounded-none border border-primary bg-card text-xs font-mono uppercase font-bold text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <Link
                  href={`/patients/${patientId}/consultations/${consultation.id}`}
                >
                  <span>Full Encounter Record</span>
                  <ExternalLink className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
