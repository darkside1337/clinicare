import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormErrorAlert } from "@/components/ui/form-error-alert";

interface ClinicalListShellProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  countLabel?: string;
  countBadgeVariant?: "outline" | "destructive";
  canAdd?: boolean;
  onAddClick?: () => void;
  actionError?: string | null;
  emptyMessage: string;
  isEmpty: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ClinicalListShell({
  icon,
  title,
  count,
  countLabel,
  countBadgeVariant = "outline",
  canAdd = false,
  onAddClick,
  actionError,
  emptyMessage,
  isEmpty,
  children,
  className = "space-y-3",
}: ClinicalListShellProps) {
  return (
    <div className={className}>
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between border-b border-primary pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {title}
          </h3>
          <Badge
            variant={countBadgeVariant}
            className={`rounded-none border-primary bg-card px-1.5 py-0 text-[10px] font-mono ${
              countBadgeVariant === "destructive"
                ? "border-clinical-critical text-clinical-critical font-semibold"
                : "text-foreground"
            }`}
          >
            {count}{countLabel ? ` ${countLabel}` : ""}
          </Badge>
        </div>

        {canAdd && onAddClick && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onAddClick}
            className="h-6 rounded-none border border-primary bg-card px-2 text-[11px] font-mono uppercase text-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="size-2.5 mr-0.5" />
            Add
          </Button>
        )}
      </div>

      {actionError && <FormErrorAlert message={actionError} />}

      {isEmpty ? (
        <EmptyState className="p-3">
          {emptyMessage}
        </EmptyState>
      ) : (
        children
      )}
    </div>
  );
}
