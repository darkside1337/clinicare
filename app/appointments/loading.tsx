import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618]">
      {/* Top Clinical Navigation Bar Skeleton */}
      <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <span className="text-[#D8D4CC] hidden sm:inline">|</span>
          <Skeleton className="h-4 w-44 hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1536px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Date & Clinician Selector Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#141618] pb-4">
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
        <div className="border border-[#141618] bg-white">
          <div className="grid grid-cols-[80px_repeat(3,1fr)] border-b border-[#141618] bg-[#F7F6F2] p-3 text-center">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-36 mx-auto" />
            <Skeleton className="h-4 w-36 mx-auto" />
            <Skeleton className="h-4 w-36 mx-auto" />
          </div>

          {/* Time Slots rows (8:00 to 17:00) */}
          <div className="divide-y divide-[#D8D4CC]">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[80px_repeat(3,1fr)] min-h-[72px] divide-x divide-[#D8D4CC]"
              >
                <div className="p-3 bg-[#FAFAF7]">
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
      </main>
    </div>
  );
}
