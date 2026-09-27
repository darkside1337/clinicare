"use client";

import React from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary pb-2">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-foreground" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Consultation History &amp; Clinical Notes ({consultations.length})
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Reverse-chronological consultation encounters. Click any record to expand details.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-none border border-primary bg-card text-xs font-mono uppercase font-bold text-foreground hover:bg-primary hover:text-primary-foreground"
        >
          <Link href={`/patients/${patientId}/consultations/new`}>
            <Plus className="size-3 mr-1" />
            New Consultation
          </Link>
        </Button>
      </div>

      {consultations.length === 0 ? (
        <EmptyState
          title="No consultations recorded for this patient."
          hint="Start a consultation to document clinical encounters."
          className="p-10"
        />
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
