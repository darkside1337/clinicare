import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { PatientsClient } from "./patients-client";
import { MOCK_SEARCH_PATIENTS } from "@/lib/mock-patients-directory";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Patients Directory | CliniCare",
  description: "Master clinical register of all clinic patients",
};

export default async function PatientsPage() {
  const reqHeaders = await headers();
  let userRole: "doctor" | "receptionist" = "doctor";
  let userName: string | undefined;

  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    if (session?.user) {
      const u = session.user as typeof session.user & { role?: string | null };
      userRole = (u.role as "doctor" | "receptionist") || "doctor";
      userName = u.name;
    }
  } catch {
    // fallback
  }

  return (
    <PatientsClient
      initialPatients={MOCK_SEARCH_PATIENTS}
      sessionRole={userRole}
      sessionUserName={userName}
    />
  );
}
