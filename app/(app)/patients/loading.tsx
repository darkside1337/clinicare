import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientsLoading() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title and Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary pb-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Search bar & Filter Tabs */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-36" />
          ))}
        </div>
      </div>

      {/* Clinical Patients Table */}
      <div className="border border-primary bg-card">
        <div className="border-b border-primary bg-muted p-3 flex justify-between items-center">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="divide-y divide-neutral-border">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28 hidden md:block" />
                <Skeleton className="h-4 w-32 hidden lg:block" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24 hidden sm:block" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
