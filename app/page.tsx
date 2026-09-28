import Link from "next/link";
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
import { getOptionalSession } from "@/lib/auth/session";
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
  const session = await getOptionalSession();
  const activeSession = session
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.role,
        clinicId: session.clinicId,
      }
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-primary)] selection:bg-[var(--color-primary)] selection:text-[var(--color-background)]">
      {/* Clinic System Topbar */}
      <header className="border-b border-[var(--color-primary)] px-4 py-3 md:px-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase font-bold tracking-widest text-[var(--color-primary)]">
            CLINICARE
          </span>
          <span className="text-[var(--color-neutral-border)]">/</span>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            PRACTICE MANAGEMENT
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          {activeSession ? (
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--color-clinical-resolved)] inline-block animate-pulse" />
              <span className="text-[var(--color-clinical-resolved)] font-semibold">
                ACTIVE: {activeSession.name.toUpperCase()} (
                {activeSession.role.toUpperCase()})
              </span>
              <form action={logoutSandboxAction}>
                <Button
                  type="submit"
                  variant="outline"
                  size="xs"
                  className="rounded-sm border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-background)]"
                >
                  <LogOut className="size-3 mr-1" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--color-clinical-warning)] inline-block" />
              <span className="text-[var(--color-text-muted)] font-semibold">
                DEMO SANDBOX READY
              </span>
              <Button
                asChild
                variant="outline"
                size="xs"
                className="rounded-sm border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-background)]"
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
        <div className="space-y-4 border-b border-[var(--color-primary)] pb-8">
          <div className="inline-flex items-center gap-2 border border-[var(--color-primary)] bg-white px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] rounded-sm shadow-[1px_1px_0px_var(--color-primary)]">
            <ShieldCheck className="size-3.5 text-[var(--color-primary)]" />
            Interactive Clinical Sandbox & Workstation Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-primary)]">
            CliniCare Practice Portal
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
            The patient profile is the centre of gravity. Designed under the{" "}
            <strong className="text-[var(--color-primary)]">
              Pathology Lab Report
            </strong>{" "}
            visual authority: structured record formatting, zero decorative
            fluff, instant clinical recall.
          </p>
        </div>

        {/* Active Session Notification (if authenticated) */}
        {activeSession && (
          <Card className="border border-[var(--color-clinical-resolved)] bg-[var(--color-clinical-resolved-bg)] rounded-sm p-4 md:p-6 shadow-[1px_1px_0px_var(--color-clinical-resolved)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="green">SESSION ESTABLISHED</Badge>
                <span className="font-mono text-xs text-[var(--color-clinical-resolved)] uppercase font-bold">
                  {activeSession.role} Access Active
                </span>
              </div>
              <h2 className="text-base font-bold text-[var(--color-primary)]">
                Currently authenticated as {activeSession.name}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Associated clinic:{" "}
                <code className="font-mono text-[var(--color-primary)]">
                  {activeSession.clinicId || "clinic-dev"}
                </code>{" "}
                • Your permissions are verified on the server.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                asChild
                className="w-full md:w-auto rounded-sm border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-background)] hover:bg-black transition-colors"
              >
                <Link href="/dashboard">
                  <span>Enter Practice Dashboard</span>
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Section 1: Interactive Sandbox Workstations (dev-only; never rendered in production) */}
        {process.env.NODE_ENV !== "production" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-neutral-border)] pb-2">
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-[var(--color-primary)]">
                  Role-Gated Workstations
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Simulate real clinical and administrative staff personas with
                  genuine Better Auth DB sessions.
                </p>
              </div>
              <Badge variant="outline">Better Auth testUtils</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Workstation 1: Doctor Persona */}
              <Card className="border border-[var(--color-primary)] bg-white rounded-sm shadow-[1px_1px_0px_var(--color-primary)] flex flex-col justify-between">
                <CardHeader className="border-b border-[var(--color-neutral-border)] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                      Clinical Persona
                    </span>
                    <Badge variant="default">FULL CLINICAL ACCESS</Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 pt-2 text-lg font-bold text-[var(--color-primary)]">
                    <Stethoscope className="size-5 text-[var(--color-primary)]" />
                    Dr. Sarah Mitchell, MD
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--color-text-muted)]">
                    Lead Family Physician • Complete access to consultations,
                    diagnosis, medical history, and prescriptions.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 pb-2 space-y-3">
                  <span className="text-xs font-mono font-semibold uppercase text-[var(--color-primary)] tracking-wider block">
                    Permitted Clinical Scope:
                  </span>
                  <ul className="text-xs space-y-2 text-[var(--color-text-muted)]">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-[var(--color-clinical-resolved)] shrink-0 mt-0.5" />
                      <span>
                        Dedicated full-page consultation recording (Vitals,
                        narrative, diagnosis)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-[var(--color-clinical-resolved)] shrink-0 mt-0.5" />
                      <span>
                        Vector prescription generation & signing with downloadable
                        PDF
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-[var(--color-clinical-resolved)] shrink-0 mt-0.5" />
                      <span>
                        Permanent two-column patient record (Allergies & chronic
                        problems)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-[var(--color-clinical-resolved)] shrink-0 mt-0.5" />
                      <span>
                        Instant walk-in creation from global Cmd+K search
                      </span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="pt-3 border-t border-[var(--color-neutral-border)] bg-[var(--color-background)]">
                  <form action={loginAsDoctorAction} className="w-full">
                    <Button
                      type="submit"
                      className="w-full justify-between rounded-sm border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-background)] hover:bg-black transition-colors"
                    >
                      <span>Launch as Doctor (Dr. Mitchell)</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>

              {/* Workstation 2: Receptionist Persona */}
              <Card className="border border-[var(--color-primary)] bg-white rounded-sm shadow-[1px_1px_0px_var(--color-primary)] flex flex-col justify-between">
                <CardHeader className="border-b border-[var(--color-neutral-border)] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                      Front-Desk Persona
                    </span>
                    <Badge variant="amber">ADMINISTRATIVE ONLY</Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 pt-2 text-lg font-bold text-[var(--color-primary)]">
                    <UserCheck className="size-5 text-[var(--color-primary)]" />
                    Alex Rivera
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--color-text-muted)]">
                    Clinic Receptionist • Front-desk scheduling and patient
                    census. Medical records and consultations are strictly
                    blocked.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 pb-2 space-y-3">
                  <span className="text-xs font-mono font-semibold uppercase text-[var(--color-primary)] tracking-wider block">
                    Enforced Boundary Scope:
                  </span>
                  <ul className="text-xs space-y-2 text-[var(--color-text-muted)]">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-[var(--color-clinical-resolved)] shrink-0 mt-0.5" />
                      <span>
                        Appointment calendar day-view & real-time queue management
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-[var(--color-clinical-resolved)] shrink-0 mt-0.5" />
                      <span>
                        Patient registration and demographic profile maintenance
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="size-3.5 text-[var(--color-clinical-critical)] shrink-0 mt-0.5" />
                      <span>
                        Clinical consultation recording (403 Forbidden
                        server-enforced)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="size-3.5 text-[var(--color-clinical-critical)] shrink-0 mt-0.5" />
                      <span>
                        Prescriptions & medical history (Server-blocked, invisible
                        in UI)
                      </span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="pt-3 border-t border-[var(--color-neutral-border)] bg-[var(--color-background)]">
                  <form action={loginAsReceptionistAction} className="w-full">
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full justify-between rounded-sm border border-[var(--color-primary)] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-background)] transition-colors"
                    >
                      <span>Launch as Receptionist (Alex Rivera)</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Section 2: Direct Clinical Surface Shortcuts */}
        <div className="space-y-4">
          <div className="border-b border-[var(--color-neutral-border)] pb-2">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-[var(--color-primary)]">
              Direct Surface Navigation
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Instant entry points into CliniCare core application views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-[var(--color-primary)] bg-white rounded-sm shadow-[1px_1px_0px_var(--color-primary)] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <LayoutDashboard className="size-4 text-[var(--color-primary)]" />
                  <Badge variant="outline">Primary View</Badge>
                </div>
                <h3 className="font-bold text-sm text-[var(--color-primary)]">
                  Practice Dashboard
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Today&apos;s timeline, queue status, practitioner filter, and
                  clinic census.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[var(--color-primary)] text-xs font-bold"
              >
                <Link href="/dashboard">
                  <span>Open</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>

            <Card className="border border-[var(--color-primary)] bg-white rounded-sm shadow-[1px_1px_0px_var(--color-primary)] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Users className="size-4 text-[var(--color-primary)]" />
                  <Badge variant="outline">Patient Index</Badge>
                </div>
                <h3 className="font-bold text-sm text-[var(--color-primary)]">
                  Patient Directory
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Searchable clinic patient registry with instant demographics
                  and record links.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[var(--color-primary)] text-xs font-bold"
              >
                <Link href="/patients">
                  <span>Open</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>

            <Card className="border border-[var(--color-primary)] bg-white rounded-sm shadow-[1px_1px_0px_var(--color-primary)] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Calendar className="size-4 text-[var(--color-primary)]" />
                  <Badge variant="outline">Day View</Badge>
                </div>
                <h3 className="font-bold text-sm text-[var(--color-primary)]">
                  Appointment Schedule
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Cross-practitioner booking calendar with walk-in flagging and
                  status switcher.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[var(--color-primary)] text-xs font-bold"
              >
                <Link href="/appointments">
                  <span>Open</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>

            <Card className="border border-[var(--color-primary)] bg-white rounded-sm shadow-[1px_1px_0px_var(--color-primary)] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <KeyRound className="size-4 text-[var(--color-primary)]" />
                  <Badge variant="outline">Better Auth</Badge>
                </div>
                <h3 className="font-bold text-sm text-[var(--color-primary)]">
                  Staff OAuth Gateway
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Official sign-in portal for staff with provisioned Google or
                  GitHub accounts.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full justify-between rounded-sm border border-[var(--color-primary)] text-xs font-bold"
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
        <Card className="border border-[var(--color-primary)] bg-white rounded-sm p-6 shadow-[1px_1px_0px_var(--color-primary)] space-y-4">
          <CardHeader className="p-0 border-b border-[var(--color-neutral-border)] pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                System Architecture
              </span>
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                SPEC: PRD.MD & ARCHITECTURE.MD
              </span>
            </div>
            <CardTitle className="text-base font-bold text-[var(--color-primary)] pt-1">
              Core Clinical Principles
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--color-text-muted)]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)]">
                  <Activity className="size-3.5 text-[var(--color-primary)]" />
                  <span>Two-Column Patient Dossier</span>
                </div>
                <p className="leading-relaxed">
                  Active allergies and chronic problems are permanently anchored
                  on the left; encounters and consultations flow on the right
                  canvas.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)]">
                  <ShieldCheck className="size-3.5 text-[var(--color-primary)]" />
                  <span>Server-Side Multi-Tenancy</span>
                </div>
                <p className="leading-relaxed">
                  Every clinical query is strictly scoped by{" "}
                  <code className="font-mono text-[var(--color-primary)]">
                    clinicId
                  </code>
                  . Receptionists cannot access consultation routes even by
                  direct URL.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-primary)]">
                  <Calendar className="size-3.5 text-[var(--color-primary)]" />
                  <span>Walk-ins are Equal Citizens</span>
                </div>
                <p className="leading-relaxed">
                  The appointment record is the single source of truth. Same-day
                  walk-in consultations automatically generate appointment
                  records with zero friction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Specification Strip */}
        <footer className="border-t border-[var(--color-primary)] pt-6 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--color-text-muted)]">
          <span>
            CliniCare • Focused Practice Management for Independent Clinics
          </span>
          <span>
            Next.js 16 • React 19 • Tailwind CSS v4 • Better Auth • Drizzle ORM
          </span>
        </footer>
      </main>
    </div>
  );
}
