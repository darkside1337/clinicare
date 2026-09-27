import React from "react";
import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/features/appointments/schema";

import { STATUS_METADATA } from "@/features/appointments/status";
export { STATUS_METADATA };

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
