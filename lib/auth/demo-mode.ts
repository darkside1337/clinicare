/**
 * Central demo-mode flag.
 *
 * This is the ONLY place in the app runtime that reads DEMO_MODE.
 * (scripts/reset-demo.ts uses isDemoResetAllowed() below; it must not
 * read process.env.DEMO_MODE directly.)
 */

/**
 * Whether demo (testUtils-backed) login is available.
 * True in every non-production environment, or in production only when
 * DEMO_MODE is exactly "true". Any other value — "1", "TRUE", unset —
 * is false.
 */
export function isDemoLoginEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.DEMO_MODE === "true";
}

/**
 * Strict gate for destructive demo tooling. Unlike isDemoLoginEnabled(),
 * there is no NODE_ENV bypass: DEMO_MODE must be exactly "true".
 */
export function isDemoResetAllowed(): boolean {
  return process.env.DEMO_MODE === "true";
}
