import { describe, it, expect } from "vitest";
import {
  discoverTableNames,
  parseConfirmTarget,
} from "@/scripts/reset-demo";

describe("scripts/reset-demo.ts", () => {
  describe("discoverTableNames", () => {
    it("discovers a non-empty table list including core tables", () => {
      const tables = discoverTableNames();
      expect(tables.length).toBeGreaterThan(0);
      expect(tables).toContain("user");
      expect(tables).toContain("patients");
      expect(tables).toContain("prescriptions");
    });

    it("excludes the drizzle migrations journal", () => {
      expect(discoverTableNames()).not.toContain("__drizzle_migrations");
    });
  });

  describe("parseConfirmTarget", () => {
    it("derives the ref from a postgres.<ref> username", () => {
      const target = parseConfirmTarget(
        "postgres://postgres.abcxyz:secret@localhost:5432/postgres"
      );
      expect(target.ref).toBe("abcxyz");
      expect(target.expectedConfirm).toBe("abcxyz");
    });

    it("derives the ref from a db.<ref>.supabase.co host", () => {
      const target = parseConfirmTarget(
        "postgres://postgres:secret@db.ref123.supabase.co:5432/postgres"
      );
      expect(target.ref).toBe("ref123");
      expect(target.expectedConfirm).toBe("ref123");
    });

    it("falls back to host/username when no ref can be parsed", () => {
      const target = parseConfirmTarget(
        "postgres://admin:secret@db.internal:5432/app"
      );
      expect(target.ref).toBeNull();
      expect(target.expectedConfirm).toBe("db.internal/admin");
    });

    it("never exposes the password", () => {
      const target = parseConfirmTarget(
        "postgres://postgres.abcxyz:s3cr3t-pw@db.abcxyz.supabase.co:5432/postgres"
      );
      expect(JSON.stringify(target)).not.toContain("s3cr3t-pw");
    });
  });
});
