/**
 * Prescription formatting and presentation helpers.
 */

export function formatRxNumber(id: string): string {
  if (!id) return "RX-UNKNOWN";
  return `RX-${id.slice(0, 8).toUpperCase()}`;
}
