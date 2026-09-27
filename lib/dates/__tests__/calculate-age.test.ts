import { describe, it, expect } from "vitest";
import { calculateAge } from "../calculate-age";

describe("lib/dates/calculate-age", () => {
  it("calculates age accurately from YYYY-MM-DD format", () => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - 30;
    const age = calculateAge(`${birthYear}-01-01`);
    expect(age).toBeGreaterThanOrEqual(29);
    expect(age).toBeLessThanOrEqual(30);
  });

  it("calculates age accurately from DD/MM/YYYY format", () => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - 45;
    const age = calculateAge(`15/05/${birthYear}`);
    expect(age).toBeGreaterThanOrEqual(44);
    expect(age).toBeLessThanOrEqual(45);
  });

  it("returns null for empty or invalid DOB string", () => {
    expect(calculateAge("")).toBeNull();
    expect(calculateAge("invalid-date")).toBeNull();
    expect(calculateAge(null)).toBeNull();
    expect(calculateAge(undefined)).toBeNull();
  });

  it("returns null for future dates", () => {
    const nextYear = new Date().getFullYear() + 2;
    expect(calculateAge(`${nextYear}-01-01`)).toBeNull();
  });

  it("returns null for years < 1900 or age > 125", () => {
    expect(calculateAge("1890-01-01")).toBeNull();
  });
});
