import React from "react";
import type { Metadata } from "next";
import { PatientsClient } from "./patients-client";
import { MOCK_SEARCH_PATIENTS } from "@/lib/mock-patients-directory";

export const metadata: Metadata = {
  title: "Patients Directory | CliniCare",
  description: "Master clinical register of all clinic patients",
};

export default function PatientsPage() {
  return <PatientsClient initialPatients={MOCK_SEARCH_PATIENTS} />;
}
