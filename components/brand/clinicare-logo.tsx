import CliniCareMark from "@/components/brand/clinicare-mark";
import { cn } from "@/lib/utils";

/**
 * CliniCare lockup: mark plus live-text wordmark (never an image).
 */
export default function CliniCareLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <CliniCareMark size={size} decorative />
      <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-foreground">
        CliniCare
      </span>
    </span>
  );
}
