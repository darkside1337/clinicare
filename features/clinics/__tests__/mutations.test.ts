import { describe, it, expect, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const pgDialect = new PgDialect();

const mockUpdate = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/lib/db/client", () => ({
  db: {
    update: (...args: unknown[]) => mockUpdate(...args),
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import { updateClinicLogo } from "../mutations";
import { getClinicById } from "../queries";

describe("features/clinics domain logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateClinicLogo", () => {
    it("updates clinics.logoUrl filtered strictly by clinicId", async () => {
      let capturedWhere: any = null;
      let capturedSet: any = null;

      const chain: any = {
        set: vi.fn().mockImplementation((val) => {
          capturedSet = val;
          return chain;
        }),
        where: vi.fn().mockImplementation((clause) => {
          capturedWhere = clause;
          return chain;
        }),
        returning: vi.fn().mockResolvedValue([
          {
            id: "clinic-test-1",
            name: "Test Practice",
            logoUrl: "https://example.supabase.co/storage/v1/object/public/clinics/clinic-test-1/logo",
          },
        ]),
      };
      mockUpdate.mockReturnValue(chain);

      const result = await updateClinicLogo(
        "clinic-test-1",
        "https://example.supabase.co/storage/v1/object/public/clinics/clinic-test-1/logo"
      );

      expect(mockUpdate).toHaveBeenCalled();
      expect(capturedSet).toEqual({
        logoUrl: "https://example.supabase.co/storage/v1/object/public/clinics/clinic-test-1/logo",
      });

      const sqlString = pgDialect.sqlToQuery(capturedWhere).sql;
      expect(sqlString).toContain('"clinics"."id" =');
      expect(result.logoUrl).toBe(
        "https://example.supabase.co/storage/v1/object/public/clinics/clinic-test-1/logo"
      );
    });

    it("throws error if clinicId is empty", async () => {
      await expect(updateClinicLogo("", "https://example.com/logo.png")).rejects.toThrow(
        "clinicId is required"
      );
    });

    it("throws error if clinic is not found", async () => {
      const chain: any = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      mockUpdate.mockReturnValue(chain);

      await expect(
        updateClinicLogo("clinic-nonexistent", "https://example.com/logo.png")
      ).rejects.toThrow("Clinic not found: clinic-nonexistent");
    });
  });

  describe("getClinicById", () => {
    it("returns null when clinicId is empty", async () => {
      const result = await getClinicById("");
      expect(result).toBeNull();
      expect(mockSelect).not.toHaveBeenCalled();
    });

    it("queries clinic filtered by clinicId", async () => {
      let capturedWhere: any = null;

      const chain: any = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation((clause) => {
            capturedWhere = clause;
            return {
              limit: vi.fn().mockResolvedValue([
                {
                  id: "clinic-1",
                  name: "St Jude Health",
                  logoUrl: null,
                },
              ]),
            };
          }),
        }),
      };
      mockSelect.mockReturnValue(chain);

      const result = await getClinicById("clinic-1");
      expect(mockSelect).toHaveBeenCalled();
      const sqlString = pgDialect.sqlToQuery(capturedWhere).sql;
      expect(sqlString).toContain('"clinics"."id" =');
      expect(result?.name).toBe("St Jude Health");
    });
  });
});
