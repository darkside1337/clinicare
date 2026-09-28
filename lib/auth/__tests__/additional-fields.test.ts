import { describe, it, expect } from "vitest";
import { auth } from "@/lib/auth/auth";

/**
 * Regression tests for the privilege-escalation lockdown:
 * clinicId and role decide which clinic's data a session can see and
 * whether it counts as a doctor. They must never be settable through
 * client-facing auth endpoints (sign-up / updateUser) — only server
 * code (seed script, admin actions via direct DB writes) may set them.
 *
 * Better Auth enforces `input: false` in parseUserInput: any client
 * value for these fields rejects with FIELD_NOT_ALLOWED.
 */
describe("lib/auth/auth.ts - privileged additionalFields lockdown", () => {
  const additionalFields = auth.options.user?.additionalFields;

  it("blocks client writes to clinicId", () => {
    expect(additionalFields?.clinicId?.input).toBe(false);
  });

  it("blocks client writes to role", () => {
    expect(additionalFields?.role?.input).toBe(false);
  });

  it("defaults new accounts to the least-privileged role", () => {
    expect(additionalFields?.role?.defaultValue).toBe("receptionist");
  });

  it("still returns both fields so session.ts can read them", () => {
    // `returned` defaults to true when omitted; assert neither field opts out.
    const clinicId = additionalFields?.clinicId as { returned?: boolean } | undefined;
    const role = additionalFields?.role as { returned?: boolean } | undefined;
    expect(clinicId?.returned ?? true).toBe(true);
    expect(role?.returned ?? true).toBe(true);
  });
});
