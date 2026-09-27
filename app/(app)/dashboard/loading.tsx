import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex w-full flex-col lg:flex-row">
      {/* LEFT COLUMN: Queue & Schedule (~68%) */}
      <section className="flex-1 border-b border-primary p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary pb-3 mb-6">
          <div className="space-y-1">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3.5 w-80" />
          </div>
          <Skeleton className="h-8 w-44" />
        </div>

        {/* Quick Metrics Cards (4 columns) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-primary bg-card p-3 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-2.5 w-28" />
            </div>
          ))}
        </div>

        {/* Table Header & Rows */}
        <div className="border border-primary bg-card">
          <div className="flex items-center justify-between border-b border-primary bg-muted p-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="divide-y divide-neutral-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-14" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Surgeon Status & Summary (~32%) */}
      <aside className="w-full lg:w-96 p-4 sm:p-6 lg:p-8 bg-muted/40 space-y-6">
        <div className="border-b border-primary pb-2">
          <Skeleton className="h-4 w-44" />
        </div>

        {/* Clinician Presence Cards */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-primary bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>

        {/* Alerts & Urgent Actions */}
        <div className="border border-primary bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </aside>
    </div>
  );
}
