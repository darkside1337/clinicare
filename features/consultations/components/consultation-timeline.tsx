"use client";

import React from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConsultationCard,
  type ConsultationCardItem,
} from "./consultation-card";

interface ConsultationTimelineProps {
  consultations: ConsultationCardItem[];
  patientId: string;
}

export function ConsultationTimeline({
  consultations,
  patientId,
}: ConsultationTimelineProps) {
  return (
    <div className="space-y-4">
      {/* Timeline Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141618] pb-2">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#141618]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141618]">
              Consultation History &amp; Clinical Notes ({consultations.length})
            </h2>
          </div>
          <p className="text-xs text-[#5A5D61] mt-0.5">
            Reverse-chronological consultation encounters. Click any record to expand details.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-none border border-[#141618] bg-white text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7]"
        >
          <Link href={`/patients/${patientId}/consultations/new`}>
            <Plus className="size-3 mr-1" />
            New Consultation
          </Link>
        </Button>
      </div>

      {consultations.length === 0 ? (
        <div className="border border-dashed border-[#D8D4CC] p-10 text-center">
          <p className="text-sm font-medium text-[#141618]">
            No consultations recorded for this patient.
          </p>
          <p className="text-xs text-[#5A5D61] mt-1">
            Start a consultation to document clinical encounters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c, index) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              patientId={patientId}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
