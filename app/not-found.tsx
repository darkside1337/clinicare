import React from "react";
import Link from "next/link";
import { FileQuestion, LayoutDashboard, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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
          <span className="text-[11px] text-[#5A5D61] uppercase tracking-wider">
            FAULT RECORD // 404
          </span>
        </div>
      </header>

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg border border-[#141618] bg-white shadow-[2px_2px_0px_#141618]">
          {/* Card Title Banner */}
          <div className="flex items-center justify-between border-b border-[#141618] bg-[#F7F6F2] px-4 py-3">
            <div className="flex items-center gap-2">
              <FileQuestion className="size-4 text-[#141618]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#141618]">
                DIAGNOSTIC STATUS: RECORD NOT FOUND
              </span>
            </div>
            <span className="font-mono text-[11px] uppercase bg-[#141618] text-[#FAFAF7] px-2 py-0.5">
              ERR_404
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-base font-bold uppercase tracking-wider text-[#141618]">
                Clinical Dossier or Route Missing
              </h1>
              <p className="text-xs text-[#5A5D61] leading-relaxed">
                The medical dossier, appointment slot, or administrative endpoint you attempted to open does not exist or has been purged from the current practice partition.
              </p>
            </div>

            <div className="border border-[#D8D4CC] bg-[#FAFAF7] p-3 text-xs font-mono space-y-1">
              <div className="text-[11px] text-[#5A5D61] uppercase">Audit Summary:</div>
              <div className="text-[#141618]">&bull; Target partition: Primary Clinical Repository</div>
              <div className="text-[#141618]">&bull; Resolution: Terminated with zero active matching records</div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="block text-[11px] font-mono uppercase font-bold text-[#5A5D61]">
                Recommended Clinical Navigation:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none border-[#141618] text-[11px] font-mono uppercase tracking-wider hover:bg-[#141618] hover:text-[#FAFAF7]"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-3 mr-1.5" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none border-[#141618] text-[11px] font-mono uppercase tracking-wider hover:bg-[#141618] hover:text-[#FAFAF7]"
                >
                  <Link href="/patients">
                    <Users className="size-3 mr-1.5" />
                    Patients
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none border-[#141618] text-[11px] font-mono uppercase tracking-wider hover:bg-[#141618] hover:text-[#FAFAF7]"
                >
                  <Link href="/appointments">
                    <Calendar className="size-3 mr-1.5" />
                    Schedule
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer System Stamp */}
      <footer className="h-10 border-t border-[#141618] bg-[#FAFAF7] px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-[#5A5D61]">
        <span>CLINICARE SYSTEM INTEGRITY DISPATCH</span>
        <span>SYSTEM INTEGRITY // ACTIVE</span>
      </footer>
    </div>
  );
}
