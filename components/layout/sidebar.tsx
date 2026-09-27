"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  Stethoscope,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

interface AppSidebarProps {
  role?: "doctor" | "receptionist";
  className?: string;
  onOpenSearch?: () => void;
}

export function AppSidebar({
  role = "doctor",
  className,
  onOpenSearch,
}: AppSidebarProps) {
  const pathname = usePathname();

  const mainNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Today's queue & census",
    },
    {
      href: "/appointments",
      label: "Appointments",
      icon: Calendar,
      description: "Schedule & day view",
    },
    {
      href: "/patients",
      label: "Patients",
      icon: Users,
      description: "Clinical directory",
    },
    ...(role === "doctor"
      ? [
          {
            href: "/settings",
            label: "Settings",
            icon: Settings,
            description: "Practice branding & storage",
          },
        ]
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
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-primary bg-background md:w-64 shrink-0 selection:bg-primary selection:text-primary-foreground",
        className
      )}
    >
      {/* Primary Navigation Section */}
      <div className="p-4 space-y-1 border-b border-neutral-border">
        <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Clinical Modules
        </div>
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2.5 rounded-none px-3 py-2 text-xs font-mono uppercase tracking-tight h-auto",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Link href={item.href}>
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Role-Specific Quick Shortcuts Section */}
      <div className="p-4 space-y-2 border-b border-neutral-border">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
            {role === "doctor" ? "Doctor Shortcuts" : "Reception Desk"}
          </span>
          <Badge
            variant={role === "doctor" ? "outline" : "amber"}
            className="text-[9px] px-1 py-0 h-4 font-mono"
          >
            {role}
          </Badge>
        </div>

        <div className="space-y-1">
          {/* Global search trigger */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleOpenSearch}
            className="w-full justify-between rounded-none border border-neutral-border bg-card px-2.5 py-1.5 text-xs font-mono text-foreground hover:bg-background h-auto"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-text-muted" />
              <span>Search Records</span>
            </div>
            <kbd className="border border-neutral-border bg-background px-1 text-[10px] text-text-muted">
              ⌘K
            </kbd>
          </Button>

          {/* New Patient Registration CTA */}
          <Button
            asChild
            variant="outline"
            size="xs"
            className="w-full justify-start gap-2 rounded-none border border-neutral-border bg-card px-2.5 py-1.5 text-xs font-mono text-foreground hover:bg-background h-auto"
          >
            <Link href="/patients/new">
              <UserPlus className="size-3.5 text-text-muted" />
              <span>Register Patient</span>
            </Link>
          </Button>

          {/* Role check: Doctor sees quick consultation access, receptionist does NOT */}
          {role === "doctor" && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleOpenSearch}
              className="w-full justify-start gap-2 rounded-none border border-primary bg-background px-2.5 py-1.5 text-xs font-mono font-bold text-foreground hover:bg-muted h-auto"
            >
              <Stethoscope className="size-3.5 text-foreground" />
              <span>Start Walk-In (⌘K)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="mt-auto p-4 border-t border-neutral-border text-[10px] font-mono text-text-muted space-y-1">
        <div className="flex items-center justify-between">
          <span>SYSTEM AUDIT</span>
          <span className="text-clinical-resolved">● ONLINE</span>
        </div>
        <div>TENANT SCOPE: VERIFIED</div>
      </div>
    </aside>
  );
}
