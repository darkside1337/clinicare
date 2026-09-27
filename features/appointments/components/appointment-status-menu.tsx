import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus } from "@/features/appointments/schema";

interface AppointmentStatusMenuProps {
  onSelect: (status: AppointmentStatus) => void;
  onClose: () => void;
  className?: string;
}

export function AppointmentStatusMenu({
  onSelect,
  onClose,
  className = "",
}: AppointmentStatusMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`z-40 w-48 border border-primary bg-card p-1 shadow-[2px_2px_0px_var(--color-primary)] divide-y divide-muted ${className}`}
    >
      <div className="px-2 py-1 text-[11px] font-mono uppercase text-text-muted">
        Update Status:
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSelect("checked-in")}
        className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
      >
        <span>Waiting</span>
        <span className="size-2 rounded-full bg-clinical-warning"></span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSelect("scheduled")}
        className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
      >
        <span>Scheduled</span>
        <span className="size-2 rounded-full bg-neutral-border"></span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSelect("completed")}
        className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
      >
        <span>Completed</span>
        <span className="size-2 rounded-full bg-clinical-resolved"></span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSelect("no-show")}
        className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
      >
        <span>No-Show</span>
        <span className="size-2 rounded-full bg-clinical-critical"></span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSelect("cancelled")}
        className="w-full text-left justify-between rounded-none px-2 py-1.5 text-xs font-mono uppercase hover:bg-background h-auto"
      >
        <span>Cancelled</span>
        <span className="size-2 rounded-full bg-text-muted"></span>
      </Button>
    </div>
  );
}
