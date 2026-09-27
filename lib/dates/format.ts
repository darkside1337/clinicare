/**
 * Date and time formatting helpers adhering to UK clinical conventions (en-GB, DD/MM/YYYY).
 */

export function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseDate(input: Date | string | null | undefined): Date | null {
  if (!input) return null;
  const d = typeof input === "string" ? new Date(input) : input;
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(input: Date | string | null | undefined, fallback: string = "—"): string {
  const d = parseDate(input);
  if (!d) return fallback;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(input: Date | string | null | undefined, fallback: string = "—"): string {
  const d = parseDate(input);
  if (!d) return fallback;
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(input: Date | string | null | undefined, fallback: string = "—"): string {
  const d = parseDate(input);
  if (!d) return fallback;
  return `${formatDate(d)} ${formatTime(d)}`;
}
