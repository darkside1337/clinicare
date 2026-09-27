"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, LayoutDashboard, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConsultationForbiddenError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const patientId = params?.id as string | undefined;

  useEffect(() => {
    console.error("Consultation route error caught:", error);
  }, [error]);

  const isForbidden =
    error.name === "ForbiddenError" ||
    error.message?.toLowerCase().includes("doctor role required") ||
    error.message?.toLowerCase().includes("forbidden");

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[60vh]">
      <Card className="w-full max-w-lg rounded-none border border-destructive bg-card shadow-[2px_2px_0px_var(--color-destructive)]">
        <CardHeader className="border-b border-destructive/20 bg-destructive/5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-destructive" />
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-destructive">
                {isForbidden ? "AUTHORIZATION RESTRICTION" : "CONSULTATION ENCOUNTER ERROR"}
              </CardTitle>
            </div>
            <Badge variant="destructive" className="rounded-none font-mono text-[10px]">
              {isForbidden ? "RESTRICTED_ROLE" : "CLINICAL_ERROR"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <h2 className="text-base font-bold text-foreground">
            {isForbidden ? "Doctor Authorization Required" : "Consultation Encounter Error"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isForbidden
              ? "Clinical consultation encounters and prescription records are restricted to registered medical doctors. Receptionist accounts cannot record, edit, or sign clinical consultations."
              : error.message || "An unexpected error occurred while loading this consultation encounter."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t border-border pt-3">
          {patientId ? (
            <Button asChild variant="outline" size="xs" className="rounded-none font-mono text-[11px]">
              <Link href={`/patients/${patientId}`}>
                <ArrowLeft className="size-3 mr-1" />
                Patient Profile
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="xs" className="rounded-none font-mono text-[11px]">
              <Link href="/patients">
                <ArrowLeft className="size-3 mr-1" />
                Directory
              </Link>
            </Button>
          )}
          {!isForbidden && (
            <Button size="xs" onClick={() => reset()} className="rounded-none font-mono text-[11px]">
              <RotateCcw className="size-3 mr-1" />
              Retry
            </Button>
          )}
          <Button asChild size="xs" className="rounded-none font-mono text-[11px]">
            <Link href="/dashboard">
              <LayoutDashboard className="size-3 mr-1" />
              Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
