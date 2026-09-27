"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // In production, forward to clinical audit error logging service
    console.error("Clinical System Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] flex flex-col justify-between selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Top Clinical Header */}
      <header className="flex h-12 w-full items-center justify-between border-b border-[#141618] bg-[#FAFAF7] px-4 sm:px-6">
        <div className="flex items-center gap-3 text-xs font-mono">
          <Link
            href="/dashboard"
            className="font-bold uppercase tracking-wider text-[#141618] hover:opacity-75 transition-opacity"
          >
            CLINICARE
          </Link>
          <span className="text-[#D8D4CC]">|</span>
          <span className="text-[11px] text-[#B91C1C] font-semibold uppercase tracking-wider">
            SYSTEM EXCEPTION INTERCEPT
          </span>
        </div>
      </header>

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg border border-destructive bg-card shadow-[2px_2px_0px_var(--color-destructive)]">
          {/* Card Title Banner */}
          <div className="flex items-center justify-between border-b border-[#B91C1C] bg-[#FFF5F5] px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-[#B91C1C]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">
                CLINICAL RUNTIME EXCEPTION
              </span>
            </div>
            <span className="font-mono text-[11px] uppercase bg-[#B91C1C] text-[#FAFAF7] px-2 py-0.5">
              FAULT_HALT
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-base font-bold uppercase tracking-wider text-[#141618]">
                Encounter Rendering Interrupted
              </h1>
              <p className="text-xs text-[#5A5D61] leading-relaxed">
                An unexpected runtime condition halted the execution of this clinical module. Patient state has been preserved to avoid clinical record divergence.
              </p>
            </div>

            <div className="border border-[#D8D4CC] bg-[#FAFAF7] p-3 text-xs font-mono space-y-1 text-[#141618]">
              <div className="text-[11px] text-[#5A5D61] uppercase font-bold">Diagnostic Trace:</div>
              <div className="text-[#B91C1C] break-words">
                {error.message || "Unspecified client evaluation error"}
              </div>
              {error.digest && (
                <div className="text-[11px] text-[#5A5D61] pt-1">
                  Digest ID: <span className="text-[#141618] font-bold">{error.digest}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#D8D4CC]">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto rounded-none border-[#141618] text-[11px] font-mono uppercase tracking-wider hover:bg-[#FAFAF7]"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3 mr-1.5" />
                  Return to Dashboard
                </Link>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => reset()}
                className="w-full sm:w-auto rounded-none bg-[#141618] text-[#FAFAF7] hover:bg-black text-[11px] font-mono uppercase tracking-wider"
              >
                <RotateCcw className="size-3 mr-1.5" />
                Retry Module
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer System Stamp */}
      <footer className="h-10 border-t border-[#141618] bg-[#FAFAF7] px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-[#5A5D61]">
        <span>FAULT INTERCEPT LOGGED TO AUDIT TRAIL</span>
        <span>SYSTEM INTEGRITY // ACTIVE</span>
      </footer>
    </div>
  );
}
