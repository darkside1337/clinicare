import React from "react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PracticeNav } from "@/components/layout/nav";
import { AppSidebar } from "@/components/layout/sidebar";
import CommandPalette from "@/components/layout/command-palette";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  let clinicName = "CliniCare Practice";
  try {
    const [clinic] = await db
      .select({ name: clinics.name })
      .from(clinics)
      .where(eq(clinics.id, session.clinicId))
      .limit(1);
    if (clinic?.name) {
      clinicName = clinic.name;
    }
  } catch (error) {
    console.error("Failed to query clinic name in AppLayout:", error);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7] flex flex-col">
      {/* Persistent Top Navigation Bar */}
      <PracticeNav
        clinicName={clinicName}
        sessionRole={session.role}
        sessionUserName={session.user.name}
      />

      {/* Main App Workspace Frame with Role-Aware Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        <AppSidebar role={session.role} />
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Cmd+K Command Palette */}
      <CommandPalette role={session.role} />
    </div>
  );
}
