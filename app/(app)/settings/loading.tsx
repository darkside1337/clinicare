import React from "react";
import { Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="mx-auto max-w-[1536px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Heading Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-foreground" />
              <h1 className="text-xl font-bold uppercase tracking-wider text-foreground">
                Practice Settings
              </h1>
            </div>
            <p className="text-xs font-mono text-text-muted mt-0.5">
              Manage practice identity, branding, and assets
            </p>
          </div>
        </div>

        {/* Settings View Skeleton */}
        <div className="space-y-6 max-w-4xl">
          {/* Clinic Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 sm:col-span-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinic Logo & Branding Card */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current / Staged Logo Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-border bg-muted/10">
                <Skeleton className="size-28 rounded-lg shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3.5 w-72" />
                </div>
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-40" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
