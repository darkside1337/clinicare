import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  UserCheck,
  Activity,
  Calendar,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Stethoscope,
  Check,
  X,
  LogOut,
  LogIn,
  KeyRound,
} from "lucide-react";
import { auth } from "@/lib/auth/auth";
import {
  loginAsDoctorAction,
  loginAsReceptionistAction,
  logoutSandboxAction,
} from "@/app/actions/sandbox-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default async function Home() {
  const reqHeaders = await headers();
  let activeSession: {
    name: string;
    email: string;
    role: string;
    clinicId?: string | null;
  } | null = null;

  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    if (session?.user) {
      const user = session.user as typeof session.user & {
        role?: string | null;
        clinicId?: string | null;
      };
      activeSession = {
        name: user.name,
        email: user.email,
        role: user.role || "doctor",
        clinicId: user.clinicId,
      };
    }
  } catch {
    activeSession = null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7]">
      {/* Clinic System Topbar */}
      <header className="border-b border-[#141618] px-4 py-3 md:px-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase font-bold tracking-widest text-[#141618]">
            CLINICARE
          </span>
          <span className="text-[#D8D4CC]">/</span>
          <span className="text-xs font-mono text-[#5A5D61]">PRACTICE MANAGEMENT</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          {activeSession ? (
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#166534] inline-block animate-pulse" />
              <span className="text-[#166534] font-semibold">
                ACTIVE: {activeSession.name.toUpperCase()} ({activeSession.role.toUpperCase()})
              </span>
              <form action={logoutSandboxAction}>
                <Button
                  type="submit"
                  variant="outline"
                  size="xs"
                  className="rounded-sm border border-[#141618] text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7]"
                >
                  <LogOut className="size-3 mr-1" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#D97706] inline-block" />
              <span className="text-[#5A5D61] font-semibold">DEMO SANDBOX READY</span>
              <Button
                asChild
                variant="outline"
                size="xs"
                className="rounded-sm border border-[#141618] text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7]"
              >
                <Link href="/login">
                  <LogIn className="size-3 mr-1" />
                  Staff OAuth Login
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Clinic Portal View */}
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-16 space-y-12">
        {/* Title Strip */}
        <div className="space-y-4 border-b border-[#141618] pb-8">
          <div className="inline-flex items-center gap-2 border border-[#141618] bg-white px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-[#5A5D61] rounded-sm shadow-[1px_1px_0px_#141618]">
            <ShieldCheck className="size-3.5 text-[#141618]" />
            Interactive Clinical Sandbox & Workstation Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#141618]">
            CliniCare Practice Portal
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-[#5A5D61] leading-relaxed">
            The patient profile is the centre of gravity. Designed under the{" "}
            <strong className="text-[#141618]">Pathology Lab Report</strong> visual authority:
            structured record formatting, zero decorative fluff, instant clinical recall.
          </p>
        </div>

        {/* Active Session Notification (if authenticated) */}
        {activeSession && (
          <Card className="border border-[#166534] bg-[#F0FDF4] rounded-sm p-4 md:p-6 shadow-[1px_1px_0px_#166534] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="green">SESSION ESTABLISHED</Badge>
                <span className="font-mono text-xs text-[#166534] uppercase font-bold">
                  {activeSession.role} Access Active
                </span>
              </div>
              <h2 className="text-base font-bold text-[#141618]">
                Currently authenticated as {activeSession.name}
              </h2>
              <p className="text-xs text-[#5A5D61]">
                Associated clinic: <code className="font-mono text-[#141618]">{activeSession.clinicId || "clinic-dev"}</code> • Your permissions are verified on the server.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                asChild
                className="w-full md:w-auto rounded-sm border border-[#141618] bg-[#141618] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#FAFAF7] hover:bg-black transition-colors"
              >
                <Link href="/dashboard">
                  <span>Enter Practice Dashboard</span>
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Section 1: Interactive Sandbox Workstations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D4CC] pb-2">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-[#141618]">
                Role-Gated Workstations
              </h2>
              <p className="text-xs text-[#5A5D61] mt-0.5">
                Simulate real clinical and administrative staff personas with genuine Better Auth DB sessions.
              </p>
            </div>
            <Badge variant="outline">Better Auth testUtils</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workstation 1: Doctor Persona */}
            <Card className="border border-[#141618] bg-white rounded-sm shadow-[1px_1px_0px_#141618] flex flex-col justify-between">
              <CardHeader className="border-b border-[#D8D4CC] pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#5A5D61]">
                    Clinical Persona
                  </span>
                  <Badge variant="default">FULL CLINICAL ACCESS</Badge>
                </div>
                <CardTitle className="flex items-center gap-2 pt-2 text-lg font-bold text-[#141618]">
                  <Stethoscope className="size-5 text-[#141618]" />
                  Dr. Sarah Mitchell, MD
                </CardTitle>
                <CardDescription className="text-xs text-[#5A5D61]">
                  Lead Family Physician • Complete access to consultations, diagnosis, medical history, and prescriptions.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 pb-2 space-y-3">
                <span className="text-xs font-mono font-semibold uppercase text-[#141618] tracking-wider block">
                  Permitted Clinical Scope:
                </span>
                <ul className="text-xs space-y-2 text-[#5A5D61]">
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#166534] shrink-0 mt-0.5" />
                    <span>Dedicated full-page consultation recording (Vitals, narrative, diagnosis)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#166534] shrink-0 mt-0.5" />
                    <span>Vector prescription generation & signing with downloadable PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#166534] shrink-0 mt-0.5" />
                    <span>Permanent two-column patient record (Allergies & chronic problems)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#166534] shrink-0 mt-0.5" />
                    <span>Instant walk-in creation from global Cmd+K search</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-3 border-t border-[#D8D4CC] bg-[#FAFAF7]">
                <form action={loginAsDoctorAction} className="w-full">
                  <Button
                    type="submit"
                    className="w-full justify-between rounded-sm border border-[#141618] bg-[#141618] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FAFAF7] hover:bg-black transition-colors"
                  >
                    <span>Launch as Doctor (Dr. Mitchell)</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>

            {/* Workstation 2: Receptionist Persona */}
            <Card className="border border-[#141618] bg-white rounded-sm shadow-[1px_1px_0px_#141618] flex flex-col justify-between">
              <CardHeader className="border-b border-[#D8D4CC] pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#5A5D61]">
                    Front-Desk Persona
                  </span>
                  <Badge variant="amber">ADMINISTRATIVE ONLY</Badge>
                </div>
                <CardTitle className="flex items-center gap-2 pt-2 text-lg font-bold text-[#141618]">
                  <UserCheck className="size-5 text-[#141618]" />
                  Alex Rivera
                </CardTitle>
                <CardDescription className="text-xs text-[#5A5D61]">
                  Clinic Receptionist • Front-desk scheduling and patient census. Medical records and consultations are strictly blocked.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 pb-2 space-y-3">
                <span className="text-xs font-mono font-semibold uppercase text-[#141618] tracking-wider block">
                  Enforced Boundary Scope:
                </span>
                <ul className="text-xs space-y-2 text-[#5A5D61]">
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#166534] shrink-0 mt-0.5" />
                    <span>Appointment calendar day-view & real-time queue management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#166534] shrink-0 mt-0.5" />
                    <span>Patient registration and demographic profile maintenance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="size-3.5 text-[#B91C1C] shrink-0 mt-0.5" />
                    <span>Clinical consultation recording (403 Forbidden server-enforced)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="size-3.5 text-[#B91C1C] shrink-0 mt-0.5" />
                    <span>Prescriptions & medical history (Server-blocked, invisible in UI)</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter className="pt-3 border-t border-[#D8D4CC] bg-[#FAFAF7]">
                <form action={loginAsReceptionistAction} className="w-full">
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full justify-between rounded-sm border border-[#141618] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7] transition-colors"
                  >
                    <span>Launch as Receptionist (Alex Rivera)</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Section 2: Direct Clinical Surface Shortcuts */}
        <div className="space-y-4">
          <div className="border-b border-[#D8D4CC] pb-2">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-[#141618]">
              Direct Surface Navigation
            </h2>
            <p className="text-xs text-[#5A5D61] mt-0.5">
              Instant entry points into CliniCare core application views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-[#141618] bg-white rounded-sm shadow-[1px_1px_0px_#141618] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <LayoutDashboard className="size-4 text-[#141618]" />
                  <Badge variant="outline">Primary View</Badge>
                </div>
                <h3 className="font-bold text-sm text-[#141618]">Practice Dashboard</h3>
                <p className="text-xs text-[#5A5D61]">
                  Today&apos;s timeline, queue status, practitioner filter, and clinic census.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[#141618] text-xs font-bold"
              >
                <Link href="/dashboard">
                  <span>Open</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>

            <Card className="border border-[#141618] bg-white rounded-sm shadow-[1px_1px_0px_#141618] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Users className="size-4 text-[#141618]" />
                  <Badge variant="outline">Patient Index</Badge>
                </div>
                <h3 className="font-bold text-sm text-[#141618]">Patient Directory</h3>
                <p className="text-xs text-[#5A5D61]">
                  Searchable clinic patient registry with instant demographics and record links.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[#141618] text-xs font-bold"
              >
                <Link href="/patients">
                  <span>Open</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>

            <Card className="border border-[#141618] bg-white rounded-sm shadow-[1px_1px_0px_#141618] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Calendar className="size-4 text-[#141618]" />
                  <Badge variant="outline">Day View</Badge>
                </div>
                <h3 className="font-bold text-sm text-[#141618]">Appointment Schedule</h3>
                <p className="text-xs text-[#5A5D61]">
                  Cross-practitioner booking calendar with walk-in flagging and status switcher.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[#141618] text-xs font-bold"
              >
                <Link href="/appointments">
                  <span>Open</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>

            <Card className="border border-[#141618] bg-white rounded-sm shadow-[1px_1px_0px_#141618] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <KeyRound className="size-4 text-[#141618]" />
                  <Badge variant="outline">Better Auth</Badge>
                </div>
                <h3 className="font-bold text-sm text-[#141618]">Staff OAuth Gateway</h3>
                <p className="text-xs text-[#5A5D61]">
                  Official sign-in portal for staff with provisioned Google or GitHub accounts.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[#141618] text-xs font-bold"
              >
                <Link href="/login">
                  <span>Open</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>

        {/* Section 3: Clinical Architecture Principles Strip */}
        <Card className="border border-[#141618] bg-white rounded-sm p-6 shadow-[1px_1px_0px_#141618] space-y-4">
          <CardHeader className="p-0 border-b border-[#D8D4CC] pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5A5D61]">
                System Architecture
              </span>
              <span className="text-[11px] font-mono text-[#5A5D61]">
                SPEC: PRD.MD & ARCHITECTURE.MD
              </span>
            </div>
            <CardTitle className="text-base font-bold text-[#141618] pt-1">
              Core Clinical Principles
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5A5D61]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#141618]">
                  <Activity className="size-3.5 text-[#141618]" />
                  <span>Two-Column Patient Dossier</span>
                </div>
                <p className="leading-relaxed">
                  Active allergies and chronic problems are permanently anchored on the left; encounters and consultations flow on the right canvas.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#141618]">
                  <ShieldCheck className="size-3.5 text-[#141618]" />
                  <span>Server-Side Multi-Tenancy</span>
                </div>
                <p className="leading-relaxed">
                  Every clinical query is strictly scoped by <code className="font-mono text-[#141618]">clinicId</code>. Receptionists cannot access consultation routes even by direct URL.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#141618]">
                  <Calendar className="size-3.5 text-[#141618]" />
                  <span>Walk-ins are Equal Citizens</span>
                </div>
                <p className="leading-relaxed">
                  The appointment record is the single source of truth. Same-day walk-in consultations automatically generate appointment records with zero friction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Specification Strip */}
        <footer className="border-t border-[#141618] pt-6 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#5A5D61]">
          <span>CliniCare • Focused Practice Management for Independent Clinics</span>
          <span>Next.js 16 • React 19 • Tailwind CSS v4 • Better Auth • Drizzle ORM</span>
        </footer>
      </main>
    </div>
  );
}
