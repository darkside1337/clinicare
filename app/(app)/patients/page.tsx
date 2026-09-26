import React from "react";
import type { Metadata } from "next";
import { PatientsClient } from "./patients-client";
import { getSession } from "@/lib/auth/session";
import { listPatientsDirectory } from "@/features/patients/queries";

export const metadata: Metadata = {
  title: "Patients Directory | CliniCare",
  description: "Master clinical register of all clinic patients",
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getSession();
  const { search } = await searchParams;

  const patientsData = await listPatientsDirectory(
    session.clinicId,
    search?.trim() || undefined
  );

  return (
    <PatientsClient
      initialPatients={patientsData}
      sessionRole={session.role}
      sessionUserName={session.user.name}
    />
  );
}
