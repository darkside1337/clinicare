import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { PatientsClient } from "./patients-client";
import { MOCK_SEARCH_PATIENTS } from "@/lib/mock-patients-directory";
import { auth } from "@/lib/auth/auth";
import { listPatientsDirectory } from "@/features/patients/queries";

export const metadata: Metadata = {
  title: "Patients Directory | CliniCare",
  description: "Master clinical register of all clinic patients",
};

export default async function PatientsPage() {
  const reqHeaders = await headers();
  let userRole: "doctor" | "receptionist" = "doctor";
  let userName: string | undefined;
  let clinicId = "clinic-dev";

  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    if (session?.user) {
      const u = session.user as typeof session.user & {
        role?: string | null;
        clinicId?: string | null;
      };
      userRole = (u.role as "doctor" | "receptionist") || "doctor";
      userName = u.name;
      if (u.clinicId) {
        clinicId = u.clinicId;
      }
    }
  } catch {
    // fallback
  }

  let patientsData;
  try {
    const dbPatients = await listPatientsDirectory(clinicId);
    if (dbPatients.length > 0) {
      patientsData = dbPatients;
    } else {
      patientsData = MOCK_SEARCH_PATIENTS;
    }
  } catch (error) {
    console.error("Failed to load patients from database:", error);
    patientsData = MOCK_SEARCH_PATIENTS;
  }

  return (
    <PatientsClient
      initialPatients={patientsData}
      sessionRole={userRole}
      sessionUserName={userName}
    />
  );
}
