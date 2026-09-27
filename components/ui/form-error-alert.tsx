import React from "react";
import { AlertCircle } from "lucide-react";

interface FormErrorAlertProps {
  message?: string | null;
  className?: string;
}

export function FormErrorAlert({ message, className = "" }: FormErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-2 border border-clinical-critical bg-clinical-critical-bg p-3 text-xs font-mono text-clinical-critical ${className}`}
    >
      <AlertCircle className="size-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
