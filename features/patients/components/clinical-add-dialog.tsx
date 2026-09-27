import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormErrorAlert } from "@/components/ui/form-error-alert";

interface ClinicalAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formError?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export function ClinicalAddDialog({
  open,
  onOpenChange,
  title,
  formError,
  isSubmitting = false,
  submitLabel = "Save",
  submittingLabel = "Saving...",
  onSubmit,
  children,
}: ClinicalAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md rounded-none border border-primary bg-card p-0 shadow-[4px_4px_0px_var(--color-primary)]">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-primary bg-muted/40 px-4 py-2.5">
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <FormErrorAlert message={formError} className="p-2" />

          {children}

          <div className="flex justify-end gap-2 border-t border-neutral-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-none border border-primary bg-card text-xs font-mono uppercase hover:bg-background"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="rounded-none border border-primary bg-primary text-xs font-mono uppercase font-bold text-primary-foreground hover:bg-black"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3 mr-1 animate-spin" />
                  {submittingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
