import Link from "next/link";
import { ArrowRight, UserCheck, Activity, Calendar, ShieldCheck, LayoutDashboard } from "lucide-react";
import { MOCK_PATIENT_RECORD } from "@/lib/mock-patient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const patient = MOCK_PATIENT_RECORD.patient;

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Clinic System Topbar */}
      <header className="border-b border-[#141618] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase font-bold tracking-widest text-[#141618]">
            CLINICARE
          </span>
          <span className="text-[#D8D4CC]">/</span>
          <span className="text-xs font-mono text-[#5A5D61]">PRACTICE MANAGEMENT</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="size-2 rounded-full bg-[#166534] inline-block animate-pulse"></span>
          <span className="text-[#166534] font-semibold">SESSION ACTIVE: DR. ALISTAIR FINCH</span>
        </div>
      </header>

      {/* Main Clinic Portal View */}
      <main className="mx-auto max-w-4xl px-6 py-16 space-y-12">
        <div className="space-y-4 border-b border-[#141618] pb-8">
          <div className="inline-flex items-center gap-2 border border-[#141618] bg-white px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-[#5A5D61]">
            <ShieldCheck className="size-3.5 text-[#141618]" />
            Clinical Practice Management Prototype
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#141618]">
            CliniCare Practice Portal
          </h1>
          <p className="max-w-2xl text-base text-[#5A5D61] leading-relaxed">
            The patient profile is the centre of gravity. Designed under the <strong>Pathology Lab Report</strong> visual authority: structured record formatting, zero decorative fluff, instant clinical recall.
          </p>
        </div>

        {/* Primary Route Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard Hub */}
          <div className="border border-[#141618] bg-white p-6 shadow-[2px_2px_0px_#141618] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#5A5D61]">
                  Primary Workstation
                </span>
                <Badge variant="amber">CLINIC QUEUE</Badge>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="size-5 text-[#141618]" />
                  <h2 className="text-xl font-bold text-[#141618]">Clinic Dashboard</h2>
                </div>
                <p className="text-xs text-[#5A5D61] mt-1">
                  Today&apos;s appointments timeline, real-time check-in status, doctor and receptionist views, and clinic census.
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline">Doctor Filter</Badge>
                  <Badge variant="outline">Live Queue</Badge>
                </div>
              </div>
            </div>

            <Button
              asChild
              className="w-full justify-between rounded-none border border-[#141618] bg-[#141618] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FAFAF7] hover:bg-black transition-colors"
            >
              <Link href="/dashboard">
                <span>Open Practice Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Patient Profile */}
          <div className="border border-[#141618] bg-white p-6 shadow-[2px_2px_0px_#141618] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#5A5D61]">
                  Primary UX Surface
                </span>
                <Badge variant="green">OPERATE MODE</Badge>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#141618]">
                  Patient Record: {patient.name}
                </h2>
                <p className="text-xs text-[#5A5D61] mt-1">
                  DOB: {patient.dob} (Age {patient.age}) • Sex: {patient.sex}
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="destructive">Allergy Flagged</Badge>
                  <Badge variant="outline">3 Consultations</Badge>
                </div>
              </div>
            </div>

            <Button
              asChild
              className="w-full justify-between rounded-none border border-[#141618] bg-[#141618] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FAFAF7] hover:bg-black transition-colors"
            >
              <Link href={`/patients/${patient.id}`}>
                <span>Open Patient Profile</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Clinical Principles Strip */}
        <div className="border border-[#141618] bg-white p-6 shadow-[2px_2px_0px_#141618] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5A5D61]">
              Clinical Architecture
            </span>
            <span className="text-[11px] font-mono text-[#5A5D61]">
              DOC: PRD.MD
            </span>
          </div>
          <h3 className="text-base font-bold text-[#141618]">Core System Principles</h3>
          <ul className="text-xs space-y-2 text-[#5A5D61]">
            <li className="flex items-center gap-2">
              <UserCheck className="size-3.5 text-[#141618]" />
              Two-column persistent summary (allergies and chronic problems always in view)
            </li>
            <li className="flex items-center gap-2">
              <Activity className="size-3.5 text-[#141618]" />
              Newest-first chronological consultation records with chief complaints
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="size-3.5 text-[#141618]" />
              Support for both scheduled clinics and walk-in encounters
            </li>
          </ul>
        </div>

        {/* Footer Specification Strip */}
        <div className="border-t border-[#141618] pt-6 flex flex-wrap items-center justify-between text-xs font-mono text-[#5A5D61]">
          <span>Focused Practice Management for Independent Clinics</span>
          <span>Next.js 16 • React 19 • Tailwind CSS v4 • Drizzle Schema</span>
        </div>
      </main>
    </div>
  );
}
