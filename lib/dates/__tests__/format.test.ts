import { describe, it, expect } from "vitest";
import { toISODate, formatDate, formatTime, formatDateTime } from "../format";

describe("lib/dates/format", () => {
  it("toISODate converts Date to YYYY-MM-DD", () => {
    const d = new Date(2026, 8, 27); // Sept 27, 2026
    expect(toISODate(d)).toBe("2026-09-27");
  });

  it("formatDate formats to DD/MM/YYYY", () => {
    const d = new Date("2026-09-27T10:30:00Z");
    const formatted = formatDate(d);
    expect(formatted).toMatch(/^27\/09\/2026$/);
  });

  it("formatDate handles invalid or empty dates with fallback", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("invalid-date")).toBe("—");
    expect(formatDate(null, "N/A")).toBe("N/A");
  });

  it("formatTime formats to HH:mm", () => {
    const d = new Date("2026-09-27T14:05:00");
    expect(formatTime(d)).toBe("14:05");
  });

  it("formatDateTime combines date and time", () => {
    const d = new Date("2026-09-27T14:05:00");
    expect(formatDateTime(d)).toBe("27/09/2026 14:05");
  });
});
