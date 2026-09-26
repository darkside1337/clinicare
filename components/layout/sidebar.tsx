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
        "flex flex-col border-r border-[#141618] bg-[#FAFAF7] w-full md:w-64 shrink-0 selection:bg-[#141618] selection:text-[#FAFAF7]",
        className
      )}
    >
      {/* Primary Navigation Section */}
      <div className="p-4 space-y-1 border-b border-[#D8D4CC]">
        <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#5A5D61]">
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
                    ? "bg-[#141618] text-[#FAFAF7] font-bold hover:bg-[#141618] hover:text-[#FAFAF7]"
                    : "text-[#141618] hover:bg-[#EFECE6]"
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
      <div className="p-4 space-y-2 border-b border-[#D8D4CC]">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A5D61]">
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
            className="w-full justify-between rounded-none border border-[#D8D4CC] bg-white px-2.5 py-1.5 text-xs font-mono text-[#141618] hover:bg-[#FAFAF7] h-auto"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-[#5A5D61]" />
              <span>Search Records</span>
            </div>
            <kbd className="border border-[#D8D4CC] bg-[#FAFAF7] px-1 text-[10px] text-[#5A5D61]">
              ⌘K
            </kbd>
          </Button>

          {/* New Patient Registration CTA */}
          <Button
            asChild
            variant="outline"
            size="xs"
            className="w-full justify-start gap-2 rounded-none border border-[#D8D4CC] bg-white px-2.5 py-1.5 text-xs font-mono text-[#141618] hover:bg-[#FAFAF7] h-auto"
          >
            <Link href="/patients/new">
              <UserPlus className="size-3.5 text-[#5A5D61]" />
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
              className="w-full justify-start gap-2 rounded-none border border-[#141618] bg-[#FAFAF7] px-2.5 py-1.5 text-xs font-mono font-bold text-[#141618] hover:bg-[#EFECE6] h-auto"
            >
              <Stethoscope className="size-3.5 text-[#141618]" />
              <span>Start Walk-In (⌘K)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="mt-auto p-4 border-t border-[#D8D4CC] text-[10px] font-mono text-[#5A5D61] space-y-1">
        <div className="flex items-center justify-between">
          <span>SYSTEM AUDIT</span>
          <span className="text-[#166534]">● ONLINE</span>
        </div>
        <div>TENANT SCOPE: VERIFIED</div>
      </div>
    </aside>
  );
}
