import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsLoading() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Date & Clinician Selector Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary pb-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-44" />
        </div>
      </div>

      {/* Doctor Column Headers Grid */}
      <div className="border border-primary bg-card">
        <div className="grid grid-cols-[80px_repeat(3,1fr)] border-b border-primary bg-muted p-3 text-center">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-36 mx-auto" />
          <Skeleton className="h-4 w-36 mx-auto" />
          <Skeleton className="h-4 w-36 mx-auto" />
        </div>

        {/* Time Slots rows (8:00 to 17:00) */}
        <div className="divide-y divide-neutral-border">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[80px_repeat(3,1fr)] min-h-[72px] divide-x divide-neutral-border"
            >
              <div className="p-3 bg-muted/40">
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="p-2">
                {i % 2 === 0 && <Skeleton className="h-14 w-full" />}
              </div>
              <div className="p-2">
                {i % 3 === 0 && <Skeleton className="h-14 w-full" />}
              </div>
              <div className="p-2">
                {i % 2 !== 0 && <Skeleton className="h-14 w-full" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
