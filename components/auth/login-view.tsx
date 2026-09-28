"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/client";
import {
  loginAsDoctorAction,
  loginAsReceptionistAction,
} from "@/app/actions/sandbox-auth";
import CliniCareLogo from "@/components/brand/clinicare-logo";
import { GithubLogo, GoogleLogo } from "@/components/svg";

export default function LoginView({
  demoEnabled,
  showDemoBanner,
}: {
  demoEnabled: boolean;
  showDemoBanner: boolean;
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setLoadingProvider(provider);
    setErrorMessage(null);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl || "/dashboard",
      });
    } catch (err: unknown) {
      console.error("Sign-in failed:", err);
      setLoadingProvider(null);
      setErrorMessage("Authentication failed. Please check your connection and try again.");
    }
  };

  return (
    <div className="w-full max-w-md border border-[#141618] bg-white p-6 sm:p-8 shadow-[2px_2px_0px_#141618] space-y-6">
      {/* Card Header */}
      <div className="space-y-2 border-b border-[#141618] pb-4">
            <CliniCareLogo size={22} />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A5D61]">
                PRACTICE ACCESS
              </span>
              <Badge variant="outline">AUTHORIZATION REQUIRED</Badge>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#141618]">
              Sign In to CliniCare
            </h1>
            <p className="text-xs text-[#5A5D61] leading-relaxed">
              Restricted to authorized doctors and clinic staff.
            </p>
          </div>

          {errorMessage && (
            <div className="border border-[#B91C1C] bg-[#FFF5F5] p-3 text-xs font-mono text-[#B91C1C] flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* GitHub OAuth Button */}
            <Button
              type="button"
              variant="outline"
              disabled={loadingProvider !== null}
              onClick={() => handleOAuthSignIn("github")}
              className="w-full justify-between rounded-none border border-[#141618] bg-white px-4 py-2.5 text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7] h-auto"
            >
              <div className="flex items-center gap-2.5">
                <GithubLogo className="size-4" />
                <span>Continue with GitHub</span>
              </div>
              <ArrowRight className="size-3.5 text-[#5A5D61]" />
            </Button>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              disabled={loadingProvider !== null}
              onClick={() => handleOAuthSignIn("google")}
              className="w-full justify-between rounded-none border border-[#141618] bg-white px-4 py-2.5 text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7] h-auto"
            >
              <div className="flex items-center gap-2.5">
                <GoogleLogo className="size-4" />
                <span>Continue with Google</span>
              </div>
              <ArrowRight className="size-3.5 text-[#5A5D61]" />
            </Button>
          </div>

          {/* Sandbox Test Personas Quick Access (demo mode only) */}
          {demoEnabled && (
          <div className="border border-[#141618] bg-[#FAFAF7] p-3.5 space-y-2">
            {showDemoBanner && (
              <p className="border border-[#141618] bg-[#141618] p-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#FAFAF7]">
                Demo environment. Data is fictional and resets periodically. Do
                not enter real patient information.
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#141618]">
                Sandbox Quick Access
              </span>
              <Badge variant="outline" className="font-mono text-[9px] uppercase">
                Demo Mode
              </Badge>
            </div>
            <p className="text-[11px] text-[#5A5D61]">
              Instant access with provisioned clinic credentials:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => loginAsDoctorAction()}
                className="rounded-none border border-[#141618] bg-white text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7] font-mono text-[11px] h-8 justify-between px-2"
              >
                <span>Dr. Sarah Mitchell</span>
                <span className="text-[9px] text-[#5A5D61] uppercase">GP</span>
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => loginAsReceptionistAction()}
                className="rounded-none border border-[#141618] bg-white text-[#141618] hover:bg-[#141618] hover:text-[#FAFAF7] font-mono text-[11px] h-8 justify-between px-2"
              >
                <span>Alex Rivera</span>
                <span className="text-[9px] text-[#5A5D61] uppercase">Rec</span>
              </Button>
            </div>
          </div>
          )}

          {/* Help & Practice Assignment Link */}
          <div className="border-t border-[#D8D4CC] pt-4 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-[#5A5D61]">
              <span>First time signing in?</span>
              <Link
                href="/login/not-set-up"
                className="font-bold text-[#141618] hover:underline flex items-center gap-1"
              >
                <HelpCircle className="size-3" />
                <span>Practice Access Help</span>
              </Link>
            </div>
            <p className="text-[11px] text-[#5A5D61]">
              Accounts must be provisioned by your clinic administrator before practice access is granted.
            </p>
          </div>
        </div>
  );
}
