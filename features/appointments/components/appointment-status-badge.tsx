import React from "react";
import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/features/appointments/schema";

export const STATUS_METADATA: Record<
  AppointmentStatus,
  { label: string; badgeVariant: "amber" | "outline" | "green" | "destructive" | "muted"; bgClass: string }
> = {
  "checked-in": {
    label: "Waiting",
    badgeVariant: "amber",
    bgClass: "bg-clinical-warning-bg border-clinical-warning",
  },
  scheduled: {
    label: "Scheduled",
    badgeVariant: "outline",
    bgClass: "bg-card border-primary",
  },
  completed: {
    label: "Completed",
    badgeVariant: "green",
    bgClass: "bg-clinical-resolved-bg border-clinical-resolved",
  },
  "no-show": {
    label: "No-Show",
    badgeVariant: "destructive",
    bgClass: "bg-clinical-critical-bg border-clinical-critical",
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "muted",
    bgClass: "bg-muted border-neutral-border",
  },
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const config = STATUS_METADATA[status] || STATUS_METADATA.scheduled;

  return (
    <Badge variant={config.badgeVariant} className={className}>
      {config.label}
    </Badge>
  );
}
