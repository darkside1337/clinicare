import React from "react";
import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { requireDoctor } from "@/lib/auth/require-doctor";
import { getClinicById } from "@/features/clinics/queries";
import { ClinicSettingsView } from "@/features/clinics/components/clinic-settings-view";

export const metadata: Metadata = {
  title: "Practice Settings | CliniCare",
  description: "Clinic configuration, branding, and storage assets",
};

export default async function SettingsPage() {
  const session = await requireDoctor();
  const clinic = await getClinicById(session.clinicId);

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="mx-auto max-w-[1536px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Heading Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-foreground" />
              <h1 className="text-xl font-bold uppercase tracking-wider text-foreground">
                Practice Settings
              </h1>
            </div>
            <p className="text-xs font-mono text-text-muted mt-0.5">
              Manage practice identity, branding, and assets
            </p>
          </div>
        </div>

        {/* Settings View */}
        <ClinicSettingsView
          clinic={clinic}
          doctorName={session.user.name}
        />
      </div>
    </div>
  );
}
