import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isDemoLoginEnabled,
  isDemoResetAllowed,
} from "@/lib/auth/demo-mode";
import { getAuthPlugins } from "@/lib/auth/auth";

function pluginIds() {
  return getAuthPlugins().map((p) => (p as { id?: string }).id);
}

describe("lib/auth/demo-mode.ts", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isDemoLoginEnabled", () => {
    it.each([
      ["unset", undefined, true],
      ["true", "true", true],
      ["false", "false", true],
      ["TRUE", "TRUE", true],
      ["1", "1", true],
    ])(
      "in development with DEMO_MODE=%s returns %s",
      (_label, value, expected) => {
        vi.stubEnv("NODE_ENV", "development");
        if (value === undefined) delete process.env.DEMO_MODE;
        else vi.stubEnv("DEMO_MODE", value);
        expect(isDemoLoginEnabled()).toBe(expected);
      }
    );

    it.each([
      ["unset", undefined, false],
      ["true", "true", true],
      ["false", "false", false],
      ["TRUE", "TRUE", false],
      ["1", "1", false],
    ])(
      "in production with DEMO_MODE=%s returns %s",
      (_label, value, expected) => {
        vi.stubEnv("NODE_ENV", "production");
        if (value === undefined) delete process.env.DEMO_MODE;
        else vi.stubEnv("DEMO_MODE", value);
        expect(isDemoLoginEnabled()).toBe(expected);
      }
    );
  });

  describe("isDemoResetAllowed", () => {
    it.each([["development"], ["production"], ["test"]])(
      "returns true only for DEMO_MODE=true (NODE_ENV=%s)",
      (nodeEnv) => {
        vi.stubEnv("NODE_ENV", nodeEnv);
        vi.stubEnv("DEMO_MODE", "true");
        expect(isDemoResetAllowed()).toBe(true);
        for (const value of ["false", "TRUE", "1", ""]) {
          vi.stubEnv("DEMO_MODE", value);
          expect(isDemoResetAllowed()).toBe(false);
        }
        delete process.env.DEMO_MODE;
        expect(isDemoResetAllowed()).toBe(false);
      }
    );
  });

  describe("getAuthPlugins", () => {
    it("includes testUtils in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.DEMO_MODE;
      expect(pluginIds()).toContain("test-utils");
    });

    it("includes testUtils in production only with DEMO_MODE=true", () => {
      vi.stubEnv("NODE_ENV", "production");
      delete process.env.DEMO_MODE;
      expect(pluginIds()).not.toContain("test-utils");
      vi.stubEnv("DEMO_MODE", "true");
      expect(pluginIds()).toContain("test-utils");
      vi.stubEnv("DEMO_MODE", "1");
      expect(pluginIds()).not.toContain("test-utils");
    });
  });
});
