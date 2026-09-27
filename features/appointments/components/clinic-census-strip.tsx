import React from "react";

interface ClinicCensusStripProps {
  waitingCount: number;
  totalBooked: number;
  completedCount: number;
  noShowCount: number;
}

export function ClinicCensusStrip({
  waitingCount,
  totalBooked,
  completedCount,
  noShowCount,
}: ClinicCensusStripProps) {
  return (
    <div className="border border-primary bg-card p-5 shadow-[1px_1px_0px_var(--color-primary)] space-y-4">
      <div className="flex items-center justify-between border-b border-primary pb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">
          CLINIC CENSUS
        </span>
        <span className="text-[11px] font-mono text-clinical-resolved font-bold">
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-neutral-border bg-background p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
            Waiting Now
          </span>
          <span className="text-2xl font-bold font-mono text-clinical-warning mt-0.5 block tabular-nums">
            {waitingCount}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            Checked-in
          </span>
        </div>

        <div className="border border-neutral-border bg-background p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
            Total Booked
          </span>
          <span className="text-2xl font-bold font-mono text-foreground mt-0.5 block tabular-nums">
            {totalBooked}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            All practitioners
          </span>
        </div>

        <div className="border border-neutral-border bg-background p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
            Completed
          </span>
          <span className="text-2xl font-bold font-mono text-clinical-resolved mt-0.5 block tabular-nums">
            {completedCount}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            Encounters done
          </span>
        </div>

        <div className="border border-neutral-border bg-background p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
            No-Show
          </span>
          <span className="text-2xl font-bold font-mono text-clinical-critical mt-0.5 block tabular-nums">
            {noShowCount}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            Missed visits
          </span>
        </div>
      </div>
    </div>
  );
}
