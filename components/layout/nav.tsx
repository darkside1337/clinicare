"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Search, Building2, Menu, X, UserPlus } from "lucide-react";
import { logoutSandboxAction } from "@/app/actions/sandbox-auth";

export interface PracticeNavProps {
  clinicName?: string;
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
  rightSlot?: React.ReactNode;
  onOpenSearch?: () => void;
}

export function PracticeNav({
  clinicName = "CliniCare Practice",
  sessionRole = "doctor",
  sessionUserName,
  rightSlot,
  onOpenSearch,
}: PracticeNavProps) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/appointments", label: "Appointments" },
    { href: "/patients", label: "Patients" },
    ...(sessionRole === "doctor"
      ? [{ href: "/settings", label: "Settings" }]
      : []),
  ];

  const handleOpenSearch = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      window.dispatchEvent(new CustomEvent("clinicare:open-search"));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-primary bg-background px-4 py-2 sm:px-6">
      {/* Brand & Clinic Identifier */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono tracking-tight">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground hover:opacity-75 transition-opacity"
        >
          <span>CLINICARE</span>
          <span className="text-[11px] text-text-muted hidden sm:inline flex items-center gap-1">
            / <Building2 className="size-3 inline" /> {clinicName}
          </span>
        </Link>
        <span className="text-neutral-border hidden md:inline">|</span>

        {/* Core Top Nav Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs font-mono uppercase">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname?.startsWith(link.href));
            return (
              <Button
                key={link.href}
                asChild
                variant={isActive ? "default" : "ghost"}
                size="xs"
                className={`rounded-none px-2.5 py-1 text-xs font-mono uppercase ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-text-muted hover:text-foreground hover:bg-muted"
                }`}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Right Actions, Search & User Context */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Global Cmd+K Search Trigger in Nav */}
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={handleOpenSearch}
          className="rounded-none border border-primary bg-card px-2.5 py-1 text-xs font-mono font-medium text-foreground hover:bg-background flex items-center gap-1.5 h-7"
          title="Search patients (⌘K)"
        >
          <Search className="size-3 text-text-muted" />
          <span className="hidden sm:inline">Search Records</span>
          <kbd className="border border-neutral-border bg-background px-1 text-[10px] text-text-muted">
            ⌘K
          </kbd>
        </Button>

        {/* User & Role Badge */}
        <Badge
          variant={sessionRole === "receptionist" ? "amber" : "outline"}
          className="font-mono text-[11px] uppercase rounded-none border-primary"
        >
          {sessionUserName ? `${sessionUserName} • ` : ""}
          Role: {sessionRole}
        </Badge>

        {rightSlot}

        {/* Mobile Hamburger Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="md:hidden rounded-none border border-primary bg-card px-2 py-1 text-xs font-mono h-7"
        >
          {mobileMenuOpen ? (
            <X className="size-3.5 text-foreground" />
          ) : (
            <Menu className="size-3.5 text-foreground" />
          )}
        </Button>

        {/* Sign Out Form Action */}
        <form action={logoutSandboxAction}>
          <Button
            type="submit"
            variant="ghost"
            size="xs"
            title="Sign out of session"
            className="text-xs font-mono text-text-muted hover:text-clinical-critical hover:bg-clinical-critical-bg rounded-none h-7"
          >
            <LogOut className="size-3 mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </form>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="w-full md:hidden border-t border-neutral-border pt-3 pb-2 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-1">
            Clinical Modules
          </div>
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname?.startsWith(link.href));
              return (
                <Button
                  key={link.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start rounded-none px-3 py-2 text-xs font-mono uppercase h-9 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              );
            })}
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 rounded-none border border-neutral-border bg-card px-3 py-2 text-xs font-mono text-foreground hover:bg-background h-9"
            >
              <Link href="/patients/new">
                <UserPlus className="size-3.5 text-text-muted" />
                <span>Register Patient</span>
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
