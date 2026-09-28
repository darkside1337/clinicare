/**
 * Typed result pattern for Server Actions per docs/ARCHITECTURE.md §6.
 * Server Actions do not throw for user-facing errors; they return an ActionResult.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
