"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Stethoscope,
  ArrowRight,
  Loader2,
  Calendar,
  Phone,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  searchPatientsAction,
  startWalkInConsultationAction,
  type CommandPalettePatientResult,
} from "@/app/(app)/actions";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  role?: "doctor" | "receptionist";
}

export default function CommandPalette({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  role = "doctor",
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<CommandPalettePatientResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeConsultationPatientId, setActiveConsultationPatientId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (isControlled) {
        setControlledOpen?.(nextOpen);
      } else {
        setInternalOpen(nextOpen);
      }
      if (!nextOpen) {
        setQuery("");
        setPatients([]);
        setActiveConsultationPatientId(null);
      }
    },
    [isControlled, setControlledOpen]
  );

  // Global hotkey listener for Cmd+K / Ctrl+K and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("clinicare:open-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("clinicare:open-search", handleCustomOpen);
    };
  }, [isOpen, setIsOpen]);

  // Debounced patient search querying real DB via Server Action
  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setPatients([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchPatientsAction(cleanQuery);
        setPatients(results);
      } catch (err) {
        console.error("Failed to search patients:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectPatient = (patientId: string) => {
    setIsOpen(false);
    startTransition(() => {
      router.push(`/patients/${patientId}`);
    });
  };

  const handleStartConsultation = async (
    e: React.MouseEvent,
    patientId: string
  ) => {
    e.stopPropagation();
    if (activeConsultationPatientId) return;

    setActiveConsultationPatientId(patientId);
    try {
      const result = await startWalkInConsultationAction(patientId);
      if (result.success && result.data?.redirectUrl) {
        setIsOpen(false);
        startTransition(() => {
          router.push(result.data!.redirectUrl);
        });
      } else {
        alert(result.error || "Unable to start walk-in consultation.");
        setActiveConsultationPatientId(null);
      }
    } catch (err) {
      console.error("Error starting consultation:", err);
      setActiveConsultationPatientId(null);
    }
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="PATIENT RECORD SEARCH"
      description="Search clinical patient directory and trigger walk-in consultations"
    >
      <div className="flex items-center justify-between border-b border-[#141618] bg-[#FAFAF7] px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold uppercase text-[#141618]">
          <Search className="size-4" />
          <span>Patient Record Search</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={role === "doctor" ? "outline" : "amber"} className="text-[10px] uppercase font-mono">
            Access: {role}
          </Badge>
          <span className="border border-[#D8D4CC] bg-white px-1.5 py-0.5 text-[10px] text-[#5A5D61]">
            ESC TO CLOSE
          </span>
        </div>
      </div>

      <CommandInput
        placeholder="Type patient name, DOB, phone, or email to search..."
        value={query}
        onValueChange={setQuery}
        className="font-mono text-xs placeholder:text-[#5A5D61]"
      />

      <CommandList className="max-h-[380px] p-2">
        {isSearching && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs font-mono text-[#5A5D61]">
            <Loader2 className="size-4 animate-spin text-[#141618]" />
            <span>Searching tenant database...</span>
          </div>
        )}

        {!isSearching && query.trim() !== "" && patients.length === 0 && (
          <CommandEmpty className="py-6 text-center text-xs font-mono text-[#5A5D61]">
            No patient records matched &quot;{query}&quot;.
            <div className="mt-3">
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/patients/new");
                }}
                className="rounded-none border-[#141618] font-mono text-xs"
              >
                Register New Patient
              </Button>
            </div>
          </CommandEmpty>
        )}

        {!isSearching && query.trim() === "" && (
          <div className="py-8 text-center text-xs font-mono text-[#5A5D61]">
            Enter a search term above to find patients across the practice.
          </div>
        )}

        {!isSearching && patients.length > 0 && (
          <CommandGroup heading={`Found ${patients.length} matching patient(s)`}>
            {patients.map((patient) => {
              const isConsultingThis = activeConsultationPatientId === patient.id;

              return (
                <CommandItem
                  key={patient.id}
                  value={`${patient.name} ${patient.dob} ${patient.phone ?? ""} ${patient.email ?? ""}`}
                  onSelect={() => handleSelectPatient(patient.id)}
                  className="flex items-center justify-between border-b border-[#D8D4CC]/60 p-2.5 hover:bg-[#EFECE6] cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-[#141618] bg-white font-mono text-[10px] font-bold uppercase text-[#141618]">
                      {patient.sex?.charAt(0) || "P"}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#141618] uppercase">
                          {patient.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] px-1 py-0 h-4 border-[#D8D4CC] text-[#5A5D61]"
                        >
                          <Calendar className="size-2.5 mr-0.5 inline" />
                          DOB: {patient.dob}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#5A5D61]">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.email && <span>{patient.email}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleSelectPatient(patient.id)}
                      className="rounded-none font-mono text-[11px] text-[#5A5D61] hover:text-[#141618] hover:bg-white h-7 px-2"
                    >
                      <span>Profile</span>
                      <ArrowRight className="size-3 ml-1" />
                    </Button>

                    {/* Role check: Doctor sees "Start Consultation" CTA; Receptionist does NOT */}
                    {role === "doctor" && (
                      <Button
                        type="button"
                        variant="default"
                        size="xs"
                        disabled={isConsultingThis || !!activeConsultationPatientId}
                        onClick={(e) => handleStartConsultation(e, patient.id)}
                        className="rounded-none border border-[#141618] bg-[#141618] font-mono text-[11px] text-[#FAFAF7] hover:bg-black h-7 px-2.5"
                      >
                        {isConsultingThis ? (
                          <>
                            <Loader2 className="size-3 animate-spin mr-1" />
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <Stethoscope className="size-3 mr-1" />
                            <span>Consult</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>

      <CommandSeparator className="bg-[#D8D4CC]" />
      <div className="flex items-center justify-between bg-[#FAFAF7] px-4 py-2 text-[10px] font-mono text-[#5A5D61]">
        <span>↑↓ Navigate • ↵ View Profile</span>
        <span>Doctor: Start Consult creates Walk-In appointment</span>
      </div>
    </CommandDialog>
  );
}
