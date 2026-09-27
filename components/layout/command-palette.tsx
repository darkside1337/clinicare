"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  ArrowRight,
  Loader2,
  Calendar,
  Phone,
  AlertCircle,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
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
  const [actionError, setActionError] = useState<string | null>(null);
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
        setActionError(null);
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

  // Query change handler owns loading/empty state so the debounced
  // effect below never calls setState synchronously in its body.
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActionError(null);
    if (!value.trim()) {
      setPatients([]);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  };

  // Debounced patient search querying real DB via Server Action
  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchPatientsAction(cleanQuery);
        setPatients(results);
      } catch (err) {
        console.error("Failed to search patients:", err);
        setPatients([]);
        setActionError("Patient search failed. Check connectivity and try again.");
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectPatient = (patientId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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
    setActionError(null);
    try {
      const result = await startWalkInConsultationAction(patientId);
      if (result.success && result.data?.redirectUrl) {
        setIsOpen(false);
        startTransition(() => {
          router.push(result.data!.redirectUrl);
        });
      } else {
        setActionError(result.error || "Unable to start walk-in consultation.");
        setActiveConsultationPatientId(null);
      }
    } catch (err) {
      console.error("Error starting consultation:", err);
      setActionError("Unexpected error starting walk-in consultation.");
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
      <div className="flex items-center justify-between border-b border-primary bg-card px-4 py-2.5 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-foreground">
          <span>Patient Record Search</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={role === "doctor" ? "outline" : "amber"} className="text-[10px] uppercase font-mono rounded-none">
            Access: {role}
          </Badge>
          <span className="border border-neutral-border bg-background px-1.5 py-0.5 text-[10px] text-text-muted font-mono">
            ESC TO CLOSE
          </span>
        </div>
      </div>

      <CommandInput
        placeholder="Type patient name, DOB, phone, or email to search..."
        value={query}
        onValueChange={handleQueryChange}
        className="font-mono text-xs placeholder:text-text-muted"
      />

      {actionError && (
        <div
          role="alert"
          aria-live="polite"
          className="mx-3 mt-3 flex items-start gap-2 border border-clinical-critical bg-clinical-critical-bg p-2.5 text-xs font-mono text-clinical-critical"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1">{actionError}</span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setActionError(null)}
            className="h-6 shrink-0 px-1.5 text-clinical-critical hover:bg-card hover:text-clinical-critical rounded-none"
          >
            Dismiss
          </Button>
        </div>
      )}

      <CommandList className="max-h-[380px] p-0">
        {isSearching && (
          <div className="flex items-center justify-center gap-2 py-8 text-xs font-mono text-text-muted">
            <Loader2 className="size-4 animate-spin text-foreground" />
            <span>Searching tenant database...</span>
          </div>
        )}

        {!isSearching && query.trim() !== "" && patients.length === 0 && (
          <CommandEmpty className="py-8 text-center text-xs font-mono text-text-muted">
            No patient records matched &quot;{query}&quot;.
            <div className="mt-3">
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/patients/new");
                }}
                className="rounded-none border-primary font-mono text-xs"
              >
                Register New Patient
              </Button>
            </div>
          </CommandEmpty>
        )}

        {!isSearching && query.trim() === "" && (
          <div className="py-8 px-4 text-center space-y-2 font-mono">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">
              Patient Directory Search
            </div>
            <p className="text-[11px] text-text-muted max-w-sm mx-auto">
              Search by patient name, date of birth, phone number, or email address.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-text-muted">
              <span className="border border-neutral-border bg-card px-1.5 py-0.5">NAME</span>
              <span className="border border-neutral-border bg-card px-1.5 py-0.5">DOB</span>
              <span className="border border-neutral-border bg-card px-1.5 py-0.5">PHONE</span>
              <span className="border border-neutral-border bg-card px-1.5 py-0.5">EMAIL</span>
            </div>
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
                  className="flex items-center justify-between border-b border-neutral-border/60 px-4 py-3 hover:bg-card/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center border border-primary bg-card font-mono text-[11px] font-bold uppercase text-foreground">
                      {patient.sex?.charAt(0) || "P"}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground uppercase tracking-wide text-xs">
                          {patient.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] px-1.5 py-0 h-4 rounded-none border-neutral-border text-text-muted"
                        >
                          <Calendar className="size-2.5 mr-1 inline" />
                          DOB: {patient.dob}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-text-muted">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.email && <span className="truncate">{patient.email}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={(e) => handleSelectPatient(patient.id, e)}
                      className="rounded-none font-mono text-[11px] text-text-muted hover:text-foreground hover:bg-background h-7 px-2.5"
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
                        className="rounded-none border border-primary bg-primary font-mono text-[11px] text-primary-foreground hover:bg-primary/90 h-7 px-3 shadow-[1px_1px_0px_var(--color-primary)]"
                      >
                        {isConsultingThis ? (
                          <>
                            <Loader2 className="size-3 animate-spin mr-1.5" />
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <Stethoscope className="size-3 mr-1.5" />
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

      <div className="flex items-center justify-between border-t border-primary bg-card px-4 py-2 text-[10px] font-mono text-text-muted">
        <div className="flex items-center gap-3">
          <span>
            <span className="border border-neutral-border bg-background px-1 py-0.5 mr-1 font-mono">↑↓</span>
            Navigate
          </span>
          <span>
            <span className="border border-neutral-border bg-background px-1 py-0.5 mr-1 font-mono">↵</span>
            View Profile
          </span>
        </div>
        <span>Doctor: Start Consult creates Walk-In appointment</span>
      </div>
    </CommandDialog>
  );
}
