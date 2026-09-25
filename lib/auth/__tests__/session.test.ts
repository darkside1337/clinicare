import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock next/navigation
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

// Mock Better Auth instance
const mockGetSession = vi.fn();
vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

// Import after mocks are established
import { getSession } from "@/lib/auth/session";

describe("lib/auth/session.ts - getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to /login when session is absent", async () => {
    mockGetSession.mockResolvedValueOnce(null);

    await expect(getSession()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should redirect to /login when session has no user object", async () => {
    mockGetSession.mockResolvedValueOnce({ user: null });

    await expect(getSession()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should redirect to /login/not-set-up when user has no clinicId assigned", async () => {
    mockGetSession.mockResolvedValueOnce({
      user: {
        id: "user-unassigned-1",
        name: "Unassigned Doctor",
        email: "doc@external.com",
        clinicId: null,
        role: "doctor",
      },
    });

    await expect(getSession()).rejects.toThrow("NEXT_REDIRECT:/login/not-set-up");
    expect(mockRedirect).toHaveBeenCalledWith("/login/not-set-up");
  });

  it("should redirect to /login/not-set-up when clinicId is an empty string", async () => {
    mockGetSession.mockResolvedValueOnce({
      user: {
        id: "user-unassigned-2",
        name: "Unassigned Receptionist",
        email: "staff@external.com",
        clinicId: "",
        role: "receptionist",
      },
    });

    await expect(getSession()).rejects.toThrow("NEXT_REDIRECT:/login/not-set-up");
    expect(mockRedirect).toHaveBeenCalledWith("/login/not-set-up");
  });

  it("should return resolved session context for a valid, clinic-linked doctor session", async () => {
    mockGetSession.mockResolvedValueOnce({
      user: {
        id: "doc-1",
        name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@clinic.dev",
        clinicId: "clinic-dev",
        role: "doctor",
      },
    });

    const session = await getSession();

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(session).toEqual({
      user: {
        id: "doc-1",
        name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@clinic.dev",
      },
      clinicId: "clinic-dev",
      role: "doctor",
    });
  });

  it("should return resolved session context for a valid, clinic-linked receptionist session", async () => {
    mockGetSession.mockResolvedValueOnce({
      user: {
        id: "rec-1",
        name: "James Miller",
        email: "james.miller@clinic.dev",
        clinicId: "clinic-dev",
        role: "receptionist",
      },
    });

    const session = await getSession();

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(session).toEqual({
      user: {
        id: "rec-1",
        name: "James Miller",
        email: "james.miller@clinic.dev",
      },
      clinicId: "clinic-dev",
      role: "receptionist",
    });
  });
});
