"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/lib/db/schema";
import type { PatientDirectoryItem } from "@/features/patients/queries";
import { PatientSearch } from "./patient-search";

type PatientRow = Patient | PatientDirectoryItem;

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const slashParts = dob.split("/");
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10) - 1;
    const year = parseInt(slashParts[2], 10);
    const birthDate = new Date(year, month, day);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    }
  }

  const dashParts = dob.split("-");
  if (dashParts.length === 3) {
    const year = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10) - 1;
    const day = parseInt(dashParts[2], 10);
    const birthDate = new Date(year, month, day);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    }
  }

  return null;
}

type FilterTab = "all" | "allergies" | "recent";

interface PatientTableProps {
  initialPatients?: PatientRow[];
}

export function PatientTable({ initialPatients = [] }: PatientTableProps) {
  const [patients] = useState<PatientRow[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (activeTab === "allergies") {
      result = result.filter((p) => {
        if ("hasSevereAllergy" in p && p.hasSevereAllergy) return true;
        return false;
      });
    }

    const cleanQuery = searchQuery.trim().toLowerCase();
    if (cleanQuery) {
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(cleanQuery);
        const dobMatch = p.dob?.includes(cleanQuery);
        const phoneMatch = p.phone?.toLowerCase().includes(cleanQuery);
        const emailMatch = p.email?.toLowerCase().includes(cleanQuery);
        const conditionMatch =
          "activeConditions" in p &&
          p.activeConditions?.some((c) => c.toLowerCase().includes(cleanQuery));

        return nameMatch || dobMatch || phoneMatch || emailMatch || conditionMatch;
      });
    }

    return result;
  }, [patients, activeTab, searchQuery]);

  const stats = useMemo(() => {
    return {
      all: patients.length,
      allergies: patients.filter((p) => "hasSevereAllergy" in p && p.hasSevereAllergy).length,
    };
  }, [patients]);

  return (
    <div className="space-y-4">
      {/* Filter Tabs and Real-Time Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-[#141618] bg-[#FAFAF7] p-2.5 shadow-[1px_1px_0px_#141618]">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant={activeTab === "all" ? "default" : "ghost"}
            size="xs"
            onClick={() => setActiveTab("all")}
            className={`rounded-none px-3 py-1 text-[11px] font-mono uppercase font-bold h-7 ${
              activeTab === "all"
                ? "bg-[#141618] text-[#FAFAF7] hover:bg-black"
                : "bg-transparent text-[#5A5D61] hover:text-[#141618] hover:bg-[#FAFAF7]"
            }`}
          >
            All Records ({stats.all})
          </Button>

          {stats.allergies > 0 && (
            <Button
              type="button"
              variant={activeTab === "allergies" ? "default" : "ghost"}
              size="xs"
              onClick={() => setActiveTab("allergies")}
              className={`rounded-none px-3 py-1 text-[11px] font-mono uppercase font-bold h-7 ${
                activeTab === "allergies"
                  ? "bg-[#B91C1C] text-[#FAFAF7] hover:bg-[#991B1B]"
                  : "bg-transparent text-[#B91C1C] hover:bg-[#FFF5F5]"
              }`}
            >
              Severe Allergies ({stats.allergies})
            </Button>
          )}
        </div>

        {/* Search Box */}
        <div className="w-full md:w-80">
          <PatientSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search name, DOB, phone, email..."
          />
        </div>
      </div>

      {/* Master Clinical Table */}
      <div className="border border-[#141618] bg-white shadow-[1px_1px_0px_#141618] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#141618] bg-[#FAFAF7] text-[11px] font-mono uppercase tracking-wider text-[#5A5D61]">
                <th className="py-2.5 px-4 font-bold">Patient / Age</th>
                <th className="py-2.5 px-4 font-bold">Sex / DOB</th>
                <th className="py-2.5 px-4 font-bold">Contact Info</th>
                <th className="py-2.5 px-4 font-bold">Safety / Conditions</th>
                <th className="py-2.5 px-4 font-bold">Registered</th>
                <th className="py-2.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CC] text-xs">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5A5D61]">
                    <div className="max-w-md mx-auto space-y-1">
                      <p className="font-bold text-[#141618] text-sm">No matching clinical records</p>
                      <p className="text-[11px] font-mono">
                        No registered patients match your active search and filter parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const calculated = calculateAge(patient.dob);
                  const displayAge =
                    "age" in patient && typeof patient.age === "number"
                      ? patient.age
                      : calculated;

                  const hasSevere =
                    "hasSevereAllergy" in patient && patient.hasSevereAllergy;
                  const allergySummary =
                    "allergySummary" in patient ? patient.allergySummary : null;

                  const conditions =
                    "activeConditions" in patient ? patient.activeConditions : null;

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-[#FAFAF7] transition-colors group"
                    >
                      {/* Name & Age */}
                      <td className="py-3 px-4 font-medium">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="font-bold text-sm text-[#141618] hover:underline block"
                        >
                          {patient.name}
                        </Link>
                        <span className="text-[11px] font-mono text-[#5A5D61]">
                          ID: {patient.id.slice(0, 8)} • {displayAge !== null ? `${displayAge}y` : "Age unrecorded"}
                        </span>
                      </td>

                      {/* Sex & DOB */}
                      <td className="py-3 px-4 text-[#5A5D61] font-mono text-[11px]">
                        <div>{patient.sex}</div>
                        <div>DOB: {patient.dob}</div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 text-[#141618] font-mono text-[11px]">
                        <div>{patient.phone || "—"}</div>
                        {patient.email && (
                          <div className="text-[#5A5D61]">{patient.email}</div>
                        )}
                      </td>

                      {/* Clinical Safety Flags / Conditions */}
                      <td className="py-3 px-4">
                        {hasSevere ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 w-fit font-mono text-[11px]"
                          >
                            <AlertTriangle className="size-3" />
                            <span>{allergySummary || "Severe Allergy"}</span>
                          </Badge>
                        ) : conditions && conditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {conditions.map((cond, idx) => (
                              <span
                                key={idx}
                                className="border border-[#D8D4CC] bg-[#FAFAF7] px-1.5 py-0.5 text-[11px] font-mono text-[#141618]"
                              >
                                {cond}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-[#5A5D61]">
                            Standard record
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 text-[11px] font-mono text-[#5A5D61]">
                        {"createdAt" in patient && patient.createdAt instanceof Date
                          ? patient.createdAt.toLocaleDateString("en-GB")
                          : "lastSeen" in patient
                          ? (patient.lastSeen as string)
                          : "Registered"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="outline"
                            size="xs"
                            className="rounded-none border border-[#141618] bg-white px-2 py-1 text-[11px] font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7]"
                          >
                            <Link href={`/patients/${patient.id}`}>
                              Profile
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="default"
                            size="xs"
                            className="rounded-none border border-[#141618] bg-[#141618] px-2 py-1 text-[11px] font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black"
                          >
                            <Link href={`/patients/${patient.id}/consultations/new`}>
                              <Stethoscope className="size-3 mr-0.5" />
                              <span>Consult</span>
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-[#141618] bg-[#FAFAF7] px-4 py-2 text-[11px] font-mono text-[#5A5D61]">
          <span>
            Showing {filteredPatients.length} of {patients.length} registered patient records
          </span>
          <span>CliniCare Practice Registry</span>
        </div>
      </div>
    </div>
  );
}
