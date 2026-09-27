import React from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { AppointmentProfileItem } from "@/features/patients/types";

interface UpcomingAppointmentsCardProps {
  appointments: AppointmentProfileItem[];
  title?: string;
  isReceptionistView?: boolean;
}

export function UpcomingAppointmentsCard({
  appointments,
  title = "Appointments",
  isReceptionistView = false,
}: UpcomingAppointmentsCardProps) {
  if (isReceptionistView) {
    return (
      <div className="border border-primary bg-card p-6 shadow-[1px_1px_0px_var(--color-primary)] space-y-4">
        <div className="flex items-center justify-between border-b border-primary pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Patient Appointments &amp; Bookings
            </h2>
          </div>
          <Badge variant="outline" className="font-mono text-[11px]">
            {appointments.length} ACTIVE
          </Badge>
        </div>

        {appointments.length === 0 ? (
          <EmptyState className="p-6">
            No upcoming appointments scheduled for this patient.
          </EmptyState>
        ) : (
          <div className="divide-y divide-neutral-border border border-neutral-border">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground text-sm">
                      {apt.scheduledAt}
                    </span>
                    <Badge
                      variant={apt.status === "checked-in" ? "amber" : "outline"}
                      className="font-mono text-[10px] uppercase"
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-muted">
                    Practitioner: <strong className="text-foreground">{apt.doctorName}</strong>
                  </div>
                  {apt.reason && (
                    <div className="text-xs text-foreground">
                      Reason: {apt.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-3">
      <div className="flex items-center justify-between border-b border-primary pb-1.5">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {title}
          </h3>
        </div>
        <Badge variant="outline" className="font-mono text-[11px]">
          {appointments.length} UPCOMING
        </Badge>
      </div>

      {appointments.length === 0 ? (
        <EmptyState className="p-4">
          No upcoming appointments scheduled
        </EmptyState>
      ) : (
        <div className="space-y-2.5">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="border border-neutral-border bg-background p-2.5 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-foreground">
                  {apt.scheduledAt}
                </span>
                <Badge
                  variant={apt.status === "checked-in" ? "amber" : "outline"}
                  className="font-mono text-[10px] uppercase"
                >
                  {apt.status}
                </Badge>
              </div>
              <div className="text-xs text-text-muted">
                Clinician: <strong className="text-foreground">{apt.doctorName}</strong>
              </div>
              {apt.reason && (
                <div className="text-[11px] text-foreground font-medium">
                  {apt.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
