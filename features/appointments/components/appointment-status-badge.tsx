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
    bgClass: "bg-[#FFFDF5] border-[#D97706]",
  },
  scheduled: {
    label: "Scheduled",
    badgeVariant: "outline",
    bgClass: "bg-white border-[#141618]",
  },
  completed: {
    label: "Completed",
    badgeVariant: "green",
    bgClass: "bg-[#F0FDF4]/50 border-[#166534]",
  },
  "no-show": {
    label: "No-Show",
    badgeVariant: "destructive",
    bgClass: "bg-[#FFF5F5] border-[#B91C1C]",
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "muted",
    bgClass: "bg-[#FAFAF7] border-[#5A5D61]",
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
