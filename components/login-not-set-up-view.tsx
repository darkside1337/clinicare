"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LoginNotSetUpView() {
  return (
    <div className="w-full max-w-lg border border-[#141618] bg-white p-6 sm:p-8 shadow-[2px_2px_0px_#141618] space-y-6">
      <div className="space-y-2 border-b border-[#141618] pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="destructive" className="flex items-center gap-1">
            <ShieldAlert className="size-3" />
            <span>UNASSIGNED ACCOUNT</span>
          </Badge>
          <span className="text-xs font-mono text-[#5A5D61]">REF: AUTH-403-CLINIC</span>
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-[#141618]">
          Account Not Yet Assigned to a Clinic
        </h1>
        <p className="text-xs text-[#5A5D61] leading-relaxed">
          Your OAuth identity has been verified successfully, but your user profile has not been allocated to an active clinic workspace.
        </p>
      </div>

      <div className="border border-[#D8D4CC] bg-[#FAFAF7] p-4 text-xs font-mono space-y-3">
        <span className="text-[11px] uppercase font-bold text-[#141618] block">
          Required Next Steps
        </span>
        <ul className="space-y-2 text-[#5A5D61]">
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#141618]">1.</span>
            <span>Contact your clinic practice manager or system administrator.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#141618]">2.</span>
            <span>Provide your registered OAuth email address to your clinic administrator.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#141618]">3.</span>
            <span>Once provisioned to your clinic workspace, sign in again to access the practice.</span>
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          asChild
          variant="default"
          className="w-full sm:flex-1 rounded-none border border-[#141618] bg-[#141618] px-4 py-2 text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black"
        >
          <Link href="/login">
            <ArrowLeft className="size-3.5 mr-1.5" />
            <span>Return to Sign In</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full sm:flex-1 rounded-none border border-[#141618] bg-white px-4 py-2 text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7]"
        >
          <Link href="/">
            <span>Practice Gateway</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
