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

export default function LoginView() {
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
      setErrorMessage("Authentication failed. Please verify provider connectivity and try again.");
    }
  };

  return (
    <div className="w-full max-w-md border border-[#141618] bg-white p-6 sm:p-8 shadow-[2px_2px_0px_#141618] space-y-6">
      {/* Card Header */}
      <div className="space-y-2 border-b border-[#141618] pb-4">
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
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
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
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25A11.96 11.96 0 000 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </div>
              <ArrowRight className="size-3.5 text-[#5A5D61]" />
            </Button>
          </div>

          {/* Sandbox Test Personas Quick Access (dev-only; never rendered in production) */}
          {process.env.NODE_ENV !== "production" && (
          <div className="border border-[#141618] bg-[#FAFAF7] p-3.5 space-y-2">
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
