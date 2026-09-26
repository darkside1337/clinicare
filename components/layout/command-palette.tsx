"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  X,
  Keyboard,
} from "lucide-react";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_SEARCH_PATIENTS, SearchPatient } from "@/lib/mock-patients-directory";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CommandPalette({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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
        setSelectedIndex(0);
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

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter patients based on query
  const cleanQuery = query.trim().toLowerCase();

  const filteredPatients: SearchPatient[] = cleanQuery
    ? MOCK_SEARCH_PATIENTS.filter((patient) => {
        const nameMatch = patient.name.toLowerCase().includes(cleanQuery);
        const dobMatch = patient.dob.includes(cleanQuery);
        const phoneMatch = patient.phone.replace(/\s+/g, "").includes(cleanQuery.replace(/\s+/g, ""));
        return nameMatch || dobMatch || phoneMatch;
      })
    : [];

  // Handle keyboard navigation inside the modal
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredPatients.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredPatients.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredPatients.length > 0) {
        setSelectedIndex((prev) =>
          prev === 0 ? filteredPatients.length - 1 : prev - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPatients.length > 0 && filteredPatients[selectedIndex]) {
        const patient = filteredPatients[selectedIndex];
        handleSelectPatient(patient.id);
      }
    }
  };

  const handleSelectPatient = (patientId: string) => {
    setIsOpen(false);
    router.push(`/patients/${patientId}`);
  };

  const handleStartConsultation = (e: React.MouseEvent, patientId: string) => {
    e.stopPropagation();
    setIsOpen(false);
    router.push(`/patients/${patientId}/consultations/new`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogPopup className="overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="flex-row items-center justify-between border-b border-[#141618] bg-[#FAFAF7] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-[#141618]" />
            <DialogTitle>PATIENT RECORD SEARCH</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block border border-[#D8D4CC] bg-white px-1.5 py-0.5 text-[11px] font-mono text-[#5A5D61]">
              ESC TO CLOSE
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsOpen(false)}
              className="size-6 p-0 hover:bg-[#EFECE6] text-[#141618]"
            >
              <X className="size-3.5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="border-b border-[#141618] bg-white p-3">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-[#5A5D61]" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search by patient name, phone, or DOB (DD/MM/YYYY)..."
              className="w-full rounded-none border border-[#141618] bg-[#FAFAF7] pl-9 pr-4 py-2 text-xs font-mono text-[#141618] focus-visible:ring-1 focus-visible:ring-[#141618]"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="max-h-[380px] overflow-y-auto bg-white p-2">
          {/* State 1: Clean Minimalist Initial State (No query yet) */}
          {cleanQuery.length === 0 && (
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto flex size-10 items-center justify-center border border-[#141618] bg-[#FAFAF7]">
                <Keyboard className="size-5 text-[#141618]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#141618]">
                  Instant Clinical Record Lookup
                </p>
                <p className="text-[11px] font-mono text-[#5A5D61] mt-1 max-w-sm mx-auto">
                  Type patient name, phone number, or birth date to query practice records.
                </p>
              </div>

              {/* Navigation Hints Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#D8D4CC] text-[11px] font-mono text-[#5A5D61]">
                <span className="inline-flex items-center gap-1 border border-[#D8D4CC] bg-[#FAFAF7] px-2 py-0.5">
                  <kbd className="font-bold text-[#141618]">↑</kbd>
                  <kbd className="font-bold text-[#141618]">↓</kbd> Navigate
                </span>
                <span className="inline-flex items-center gap-1 border border-[#D8D4CC] bg-[#FAFAF7] px-2 py-0.5">
                  <kbd className="font-bold text-[#141618]">↵</kbd> Open Profile
                </span>
                <span className="inline-flex items-center gap-1 border border-[#D8D4CC] bg-[#FAFAF7] px-2 py-0.5">
                  <kbd className="font-bold text-[#141618]">ESC</kbd> Dismiss
                </span>
              </div>
            </div>
          )}

          {/* State 2: Query entered, No matches */}
          {cleanQuery.length > 0 && filteredPatients.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#141618]">
                No Matching Patient Records Found
              </p>
              <p className="text-[11px] font-mono text-[#5A5D61]">
                No registered clinic records match &quot;{query}&quot;. Check search query or search by name.
              </p>
            </div>
          )}

          {/* State 3: Active Results List */}
          {cleanQuery.length > 0 && filteredPatients.length > 0 && (
            <ul className="space-y-1.5" role="listbox">
              {filteredPatients.map((patient, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <li
                    key={patient.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectPatient(patient.id)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#141618] bg-[#FAFAF7] shadow-[1px_1px_0px_#141618]"
                        : "border-[#D8D4CC] bg-white hover:border-[#141618] hover:bg-[#FAFAF7]"
                    }`}
                  >
                    {/* Patient Clinical Identifiers */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#141618]">
                          {patient.name}
                        </span>
                        <span className="text-[11px] font-mono text-[#5A5D61]">
                          ({patient.age}y • DOB: {patient.dob})
                        </span>
                        {patient.hasSevereAllergy && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 px-1.5 py-0 text-[11px]"
                          >
                            <AlertTriangle className="size-2.5" />
                            <span>ALLERGY: {patient.allergySummary || "Flagged"}</span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#5A5D61]">
                        <span>
                          Phone: <strong className="text-[#141618]">{patient.phone}</strong>
                        </span>
                        <span>•</span>
                        <span>Sex: {patient.sex}</span>
                        <span>•</span>
                        <span>Last: {patient.lastSeen}</span>
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <Button
                        type="button"
                        variant="default"
                        size="xs"
                        onClick={(e) => handleStartConsultation(e, patient.id)}
                        className="rounded-none border border-[#141618] bg-[#141618] px-2.5 py-1 text-[11px] font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1"
                      >
                        <Stethoscope className="size-3" />
                        <span>Walk-In</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handleSelectPatient(patient.id)}
                        className="rounded-none border border-[#141618] bg-white px-2.5 py-1 text-[11px] font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7] flex items-center gap-1"
                      >
                        <span>Profile</span>
                        <ArrowRight className="size-3" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Modal Footer Strip */}
        <div className="border-t border-[#141618] bg-[#FAFAF7] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-[#5A5D61]">
          <span>CliniCare Practice Registry Index</span>
          <span>{MOCK_SEARCH_PATIENTS.length} Active Records</span>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
