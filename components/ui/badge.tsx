import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border px-1.5 py-0.5 text-[11px] font-mono font-medium tracking-tight uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-clinical-critical bg-clinical-critical-bg text-clinical-critical",
        outline: "text-foreground border-border bg-card",
        amber: "border-clinical-warning bg-clinical-warning-bg text-clinical-warning",
        green: "border-clinical-resolved bg-clinical-resolved-bg text-clinical-resolved",
        muted: "border-neutral-border bg-neutral-subtle text-text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
