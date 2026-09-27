import { describe, it, expect } from "vitest";
import { formatRxNumber } from "../presenters";

describe("features/prescriptions/presenters", () => {
  it("formats 8-char uppercase prescription number", () => {
    expect(formatRxNumber("ab12cd34-5678")).toBe("RX-AB12CD34");
    expect(formatRxNumber("12345678")).toBe("RX-12345678");
  });

  it("handles empty or missing ids gracefully", () => {
    expect(formatRxNumber("")).toBe("RX-UNKNOWN");
  });
});
