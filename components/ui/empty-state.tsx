import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border border-dashed border-neutral-border bg-card p-6 text-center text-xs font-mono text-text-muted ${className}`}
    >
      {icon && <div className="mx-auto mb-2 flex justify-center text-neutral-border">{icon}</div>}
      {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
      {hint && <p className="text-xs text-text-muted mt-1 font-mono">{hint}</p>}
      {children}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}
