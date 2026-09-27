"use client";

import React, { useState, useTransition } from "react";
import { Building2, Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Clinic } from "@/lib/db/schema";
import { uploadClinicLogoAction } from "@/app/(app)/settings/actions";

interface ClinicSettingsViewProps {
  clinic: Clinic | null;
  doctorName?: string;
}

export function ClinicSettingsView({
  clinic,
  doctorName,
}: ClinicSettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(
    clinic?.logoUrl ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPEG, WebP, SVG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 2MB limit.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please choose an image file to upload.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("logo", selectedFile);

    startTransition(async () => {
      const res = await uploadClinicLogoAction(formData);
      if (res.success) {
        setLogoPreview(res.data.logoUrl);
        setSuccessMsg("Clinic logo updated successfully! It will now appear on all prescription PDFs.");
        setSelectedFile(null);
      } else {
        setErrorMsg(res.error);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Clinic Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <span>Clinic Profile</span>
              </CardTitle>
              <CardDescription>
                Practice metadata and identity settings
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs uppercase">
              Role: Doctor Admin
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <span className="text-text-muted text-xs block">Practice Name</span>
              <span className="font-semibold text-foreground">
                {clinic?.name || "CliniCare Practice"}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <span className="text-text-muted text-xs block">Clinic ID</span>
              <span className="text-xs text-foreground select-all">
                {clinic?.id || "N/A"}
              </span>
            </div>
            {doctorName && (
              <div className="p-3 rounded-lg border border-border bg-muted/20 sm:col-span-2">
                <span className="text-text-muted text-xs block">Active Clinician</span>
                <span className="text-xs font-semibold text-foreground">
                  Dr. {doctorName}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clinic Logo & Branding Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="size-5 text-primary" />
            <span>Clinic Logo & Branding</span>
          </CardTitle>
          <CardDescription>
            Upload your clinic logo. This image is stored securely via Supabase Storage and will appear at the header of all generated prescription PDFs.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleUpload}>
          <CardContent className="space-y-6">
            {/* Current / Staged Logo Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-border bg-muted/10">
              <div className="relative size-28 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center shrink-0">
                {logoPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoPreview}
                    alt="Clinic Logo Preview"
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-text-muted p-2 text-center">
                    <ImageIcon className="size-8 mb-1 opacity-50" />
                    <span className="text-[10px] font-mono">No logo</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <h4 className="font-medium text-foreground">
                  {logoPreview ? "Active / Staged Logo" : "No Logo Uploaded Yet"}
                </h4>
                <p className="text-text-muted text-xs leading-relaxed">
                  Recommended: Transparent PNG or SVG, at least 300x100px. Max size 2MB.
                </p>
                {clinic?.logoUrl && !selectedFile && (
                  <p className="text-xs font-mono text-primary truncate max-w-md">
                    Live URL: {clinic.logoUrl}
                  </p>
                )}
              </div>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <label
                htmlFor="clinic-logo-input"
                className="text-xs font-mono uppercase tracking-wider text-text-muted block"
              >
                Select Logo Image
              </label>
              <Input
                id="clinic-logo-input"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                disabled={isPending}
                className="cursor-pointer font-mono text-xs"
              />
            </div>

            {/* Live Feedback */}
            <div aria-live="polite">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            <span className="text-xs text-text-muted font-mono">
              {selectedFile ? `Selected: ${selectedFile.name}` : "Ready"}
            </span>
            <Button
              type="submit"
              disabled={isPending || !selectedFile}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  <span>Upload & Save Logo</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
