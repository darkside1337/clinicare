/**
 * CliniCare mark — inline SVG transcription of public/brand/clinicare-mark.svg.
 * Geometry is identical to the artwork file; colours are mapped to design
 * tokens (see app/globals.css) so the mark adapts to the theme:
 *   ink (cross stroke + shadow) -> foreground
 *   paper (cross body)          -> background
 *   grid lines                  -> neutral-border
 *   flagged cell (only red)     -> destructive
 */
export default function CliniCareMark({
  size = 24,
  className,
  decorative = false,
}: {
  size?: number;
  className?: string;
  /** Set when the mark sits next to the text wordmark. */
  decorative?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "CliniCare"}
      aria-hidden={decorative || undefined}
    >
      {/* hard offset shadow */}
      <path
        d="M9 1h12v8h8v12h-8v8H9v-8H1V9h8z"
        transform="translate(2 2)"
        className="fill-foreground"
      />
      {/* cross body */}
      <path
        d="M9 1h12v8h8v12h-8v8H9v-8H1V9h8z"
        className="fill-background stroke-foreground"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* ruled grid */}
      <path
        d="M13 2v26M17 2v26M5 10v10M9 10v10M21 10v10M25 10v10M2 13h26M2 17h26M10 5h10M10 9h10M10 21h10M10 25h10"
        fill="none"
        className="stroke-neutral-border"
        strokeWidth="1"
      />
      {/* flagged cell — the only red element */}
      <rect x="13" y="13" width="4" height="4" className="fill-destructive" />
    </svg>
  );
}
