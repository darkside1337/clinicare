"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOCTORS } from "@/features/appointments/constants";

interface CalendarControlBarProps {
  activeDate: Date;
  currentDoctorId?: string;
  onNavigate: (targetDate: Date, doctorId?: string) => void;
  className?: string;
}

function formatDateString(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CalendarControlBar({
  activeDate,
  currentDoctorId,
  onNavigate,
  className,
}: CalendarControlBarProps) {
  const [clinicianMenuOpen, setClinicianMenuOpen] = useState(false);

  const activeDoctor = React.useMemo(() => {
    if (!currentDoctorId) return "All Clinicians";
    const found = DOCTORS.find((d) => d.id === currentDoctorId);
    return found ? found.name : "All Clinicians";
  }, [currentDoctorId]);

  const handlePrevDay = () => {
    const prev = new Date(activeDate);
    prev.setDate(prev.getDate() - 1);
    onNavigate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(activeDate);
    next.setDate(next.getDate() + 1);
    onNavigate(next);
  };

  const handleToday = () => {
    onNavigate(new Date());
  };

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border border-primary bg-card p-3 sm:p-4 shadow-[1px_1px_0px_var(--color-primary)] ${
        className || ""
      }`}
    >
      {/* Date Selector Navigation */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-primary bg-background">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handlePrevDay}
            className="size-8 p-0 rounded-none hover:bg-muted text-foreground"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous Day</span>
          </Button>
          <div className="px-3 py-1 font-mono text-xs font-bold text-foreground border-x border-primary bg-card min-w-[200px] text-center tabular-nums">
            {formatDateString(activeDate)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleNextDay}
            className="size-8 p-0 rounded-none hover:bg-muted text-foreground"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next Day</span>
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="rounded-none border-primary text-xs font-mono uppercase h-8 hover:bg-muted"
        >
          Today
        </Button>
      </div>

      {/* Clinician Column Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
          View Columns:
        </span>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setClinicianMenuOpen(!clinicianMenuOpen)}
            className="rounded-none border-primary bg-card px-3 py-1.5 text-xs font-mono text-foreground hover:bg-muted flex items-center justify-between gap-2 min-w-[200px]"
          >
            <span className="truncate">{activeDoctor}</span>
            <ChevronDown className="size-3.5 text-foreground shrink-0" />
          </Button>

          {clinicianMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-40 w-56 border border-primary bg-card p-1 shadow-[2px_2px_0px_var(--color-primary)]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setClinicianMenuOpen(false);
                  onNavigate(activeDate, "all");
                }}
                className={`w-full justify-start rounded-none px-2.5 py-1.5 text-xs text-left h-auto font-mono ${
                  !currentDoctorId
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                All Clinicians
              </Button>
              {DOCTORS.map((doc) => {
                const isSelected = currentDoctorId === doc.id;
                return (
                  <Button
                    key={doc.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setClinicianMenuOpen(false);
                      onNavigate(activeDate, doc.id);
                    }}
                    className={`w-full justify-start rounded-none px-2.5 py-1.5 text-xs text-left h-auto font-mono ${
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {doc.name} {doc.specialty ? `(${doc.specialty})` : ""}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
