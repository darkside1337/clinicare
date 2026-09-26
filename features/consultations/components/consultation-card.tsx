"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pill, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

function formatDate(consultation: {
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
  const d =
    typeof consultation.createdAt === "string"
      ? new Date(consultation.createdAt)
      : consultation.createdAt;
  if (isNaN(d.getTime())) {
    return { date: "—", time: "—" };
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
  };
}

export function ConsultationCard({
  consultation,
  patientId,
  defaultExpanded = false,
}: ConsultationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { date, time } = formatDate(consultation);
  const encounterType =
    consultation.type ||
    (consultation.appointment?.isWalkIn ? "Walk-In" : "Scheduled");
  const hasPrescription =
    consultation.hasPrescription || Boolean(consultation.prescriptionId);

  return (
    <article className="border border-[#141618] bg-white shadow-[1px_1px_0px_#141618] transition-shadow">
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between border-b border-[#141618] bg-[#F7F6F2] px-4 py-2.5 hover:bg-[#EFECE6] transition-colors"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-mono text-xs font-bold text-[#141618]">
            {date} • {time}
          </span>
          <Badge
            variant="outline"
            className="rounded-none border-[#141618] bg-white px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-[#141618]"
          >
            {encounterType}
          </Badge>
          <span className="text-xs text-[#5A5D61]">
            Clinician:{" "}
            <strong className="text-[#141618] font-medium">
              {consultation.doctorName || "Attending Doctor"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#5A5D61] hidden sm:inline">
            REF: {consultation.id.slice(0, 8)}
          </span>
          <ChevronRight
            className={`size-4 text-[#141618] transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* Summary View */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
              Chief Complaint
            </span>
            <p className="text-xs font-semibold text-[#141618] mt-0.5">
              {consultation.chiefComplaint || "—"}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
              Primary Diagnosis
            </span>
            <p className="text-xs font-semibold text-[#141618] mt-0.5">
              {consultation.diagnosis || "Under clinical evaluation"}
            </p>
          </div>
        </div>

        {/* Expanded Clinical Narrative */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[#D8D4CC] space-y-4">
            {consultation.symptoms && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  Symptoms &amp; History
                </span>
                <p className="text-xs text-[#141618] leading-relaxed mt-0.5">
                  {consultation.symptoms}
                </p>
              </div>
            )}

            {consultation.observations && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  Clinical Observations
                </span>
                <div className="mt-0.5 border border-[#141618] bg-[#FAFAF7] p-2.5 font-mono text-xs text-[#141618]">
                  {consultation.observations}
                </div>
              </div>
            )}

            {consultation.treatment && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  Treatment &amp; Management Plan
                </span>
                <p className="text-xs text-[#141618] leading-relaxed mt-0.5">
                  {consultation.treatment}
                </p>
              </div>
            )}

            {consultation.notes && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A5D61] block">
                  Clinical Notes
                </span>
                <p className="text-xs text-[#141618] leading-relaxed mt-0.5 italic">
                  {consultation.notes}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFECE6]">
              {hasPrescription ? (
                <div className="flex items-center gap-2 text-xs font-medium text-[#141618]">
                  <Pill className="size-3.5 text-[#141618]" />
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
                className="rounded-none border border-[#141618] bg-white text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7]"
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
