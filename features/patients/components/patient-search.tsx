"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PatientSearchProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function PatientSearch({
  value = "",
  onChange,
  placeholder = "Search by name, DOB, phone, or condition...",
  debounceMs = 300,
  className,
}: PatientSearchProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync internal state if external value changes (render-time adjustment,
  // avoids cascading renders from setState-in-effect)
  if (value !== prevValue) {
    setPrevValue(value);
    setInternalValue(value);
  }

  // Debounce the search callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  return (
    <div className={`relative flex items-center ${className || ""}`}>
      <Search className="pointer-events-none absolute left-3 size-3.5 text-[#5A5D61]" />
      <Input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-none border border-[#141618] bg-white pl-8 pr-8 py-1.5 text-xs font-mono placeholder:text-[#5A5D61]"
      />
      {internalValue && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleClear}
          className="absolute right-1 size-6 p-0 hover:bg-transparent text-[#5A5D61] hover:text-[#141618]"
        >
          <X className="size-3" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
