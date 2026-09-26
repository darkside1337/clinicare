"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function AppWorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App workspace error caught:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[60vh]">
      <Card className="w-full max-w-md rounded-none border border-destructive bg-card shadow-[2px_2px_0px_#B91C1C]">
        <CardHeader className="border-b border-destructive/20 bg-destructive/5 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-destructive">
              CLINICAL WORKSPACE ERROR
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            A runtime error occurred in this workspace module. Patient clinical records remain intact.
          </p>
          <div className="border border-border bg-muted/40 p-2.5 font-mono text-[11px] text-destructive break-words">
            {error.message || "An unexpected error occurred."}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t border-border pt-3">
          <Button asChild variant="outline" size="xs" className="rounded-none font-mono text-[11px]">
            <Link href="/dashboard">
              <LayoutDashboard className="size-3 mr-1" />
              Dashboard
            </Link>
          </Button>
          <Button size="xs" onClick={() => reset()} className="rounded-none font-mono text-[11px]">
            <RotateCcw className="size-3 mr-1" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
