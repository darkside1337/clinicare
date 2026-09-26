import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientProfileLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618]">
      {/* Top Clinical Navigation Bar Skeleton */}
      <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <span className="text-[#D8D4CC] hidden sm:inline">|</span>
          <Skeleton className="h-4 w-52 hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-44" />
        </div>
      </header>

      {/* Patient Demographic Identity Banner Skeleton */}
      <div className="border-b border-[#141618] bg-white p-4 sm:p-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1536px] flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-44" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Profile Workspace */}
      <main className="mx-auto flex w-full max-w-[1536px] flex-col lg:flex-row">
        {/* Left Column: Clinical Summary (30%) */}
        <aside className="w-full lg:w-80 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-[#141618] p-4 sm:p-6 bg-[#FAFAF7] space-y-6">
          {/* Allergies section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#141618] pb-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="border border-[#141618] bg-white p-3 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          {/* Problems section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#141618] pb-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="border border-[#141618] bg-white p-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>

          {/* Demographics details */}
          <div className="space-y-2 border-t border-[#141618] pt-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-36" />
          </div>
        </aside>

        {/* Right Column: Tab View (70%) */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Tab Navigation Skeleton */}
          <div className="flex gap-2 border-b border-[#141618] pb-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-28" />
            ))}
          </div>

          {/* Tab Content Cards */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-[#141618] bg-white p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
