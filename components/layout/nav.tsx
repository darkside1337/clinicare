"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logoutSandboxAction } from "@/app/actions/sandbox-auth";

interface PracticeNavProps {
  sessionRole?: "doctor" | "receptionist";
  sessionUserName?: string;
  rightSlot?: React.ReactNode;
}

export function PracticeNav({
  sessionRole = "doctor",
  sessionUserName,
  rightSlot,
}: PracticeNavProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/appointments", label: "Appointments" },
    { href: "/patients", label: "Patients" },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-auto min-h-12 w-full flex-wrap items-center justify-between gap-3 border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono tracking-tight">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#141618] hover:opacity-75 transition-opacity"
        >
          <span>CLINICARE</span>
          <span className="text-[11px] text-[#5A5D61] hidden sm:inline">
            / PRACTICE
          </span>
        </Link>
        <span className="text-[#D8D4CC] hidden sm:inline">|</span>
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-mono uppercase">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 transition-colors rounded-sm ${
                  isActive
                    ? "bg-[#141618] text-[#FAFAF7] font-bold"
                    : "text-[#5A5D61] hover:text-[#141618] hover:bg-[#EFECE6]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <Badge
          variant={sessionRole === "receptionist" ? "amber" : "outline"}
          className="font-mono text-[11px] uppercase"
        >
          {sessionUserName ? `${sessionUserName} • ` : ""}
          Role: {sessionRole}
        </Badge>

        {rightSlot}

        <form action={logoutSandboxAction}>
          <Button
            type="submit"
            variant="ghost"
            size="xs"
            title="Sign out of session"
            className="text-xs font-mono text-[#5A5D61] hover:text-[#B91C1C] hover:bg-[#FFF5F5] rounded-sm"
          >
            <LogOut className="size-3 mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
