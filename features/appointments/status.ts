import type { AppointmentStatus } from "./schema";

export interface StatusConfig {
  label: string;
  badgeVariant: "amber" | "outline" | "green" | "destructive" | "muted";
  bgClass: string;
  rowBg: string;
}

export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
  "checked-in": {
    label: "Waiting",
    badgeVariant: "amber",
    bgClass: "bg-clinical-warning-bg border-clinical-warning",
    rowBg: "bg-clinical-warning-bg/40",
  },
  scheduled: {
    label: "Scheduled",
    badgeVariant: "outline",
    bgClass: "bg-card border-primary",
    rowBg: "bg-card",
  },
  completed: {
    label: "Completed",
    badgeVariant: "green",
    bgClass: "bg-clinical-resolved-bg border-clinical-resolved",
    rowBg: "bg-clinical-resolved-bg/20",
  },
  "no-show": {
    label: "No-Show",
    badgeVariant: "destructive",
    bgClass: "bg-clinical-critical-bg border-clinical-critical",
    rowBg: "bg-clinical-critical-bg/20",
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "muted",
    bgClass: "bg-muted border-neutral-border",
    rowBg: "bg-muted/30",
  },
};

export const STATUS_METADATA = APPOINTMENT_STATUS_CONFIG;
export const DASHBOARD_STATUS_CONFIG = APPOINTMENT_STATUS_CONFIG;
