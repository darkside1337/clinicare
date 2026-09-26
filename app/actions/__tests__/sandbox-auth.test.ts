import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieSet, mockCookieDelete, mockRedirect, mockTestLogin, mockSignOut } = vi.hoisted(() => ({
  mockCookieSet: vi.fn(),
  mockCookieDelete: vi.fn(),
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  mockTestLogin: vi.fn(),
  mockSignOut: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({
    set: mockCookieSet,
    delete: mockCookieDelete,
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

// Mock Better Auth instance
vi.mock("@/lib/auth/auth", () => ({
  auth: {
    $context: Promise.resolve({
      test: {
        login: (...args: unknown[]) => mockTestLogin(...args),
      },
    }),
    api: {
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}));

import {
  loginAsDoctorAction,
  loginAsReceptionistAction,
  loginAsDemoPersona,
  logoutSandboxAction,
} from "@/app/actions/sandbox-auth";
import { DEMO_PERSONAS } from "@/lib/auth/demo-personas";

describe("app/actions/sandbox-auth.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log in as doctor with seeded doctor ID and set session cookies", async () => {
    mockTestLogin.mockResolvedValueOnce({
      session: { id: "s-1", userId: DEMO_PERSONAS.doctor.userId },
      user: { id: DEMO_PERSONAS.doctor.userId, name: DEMO_PERSONAS.doctor.name },
      cookies: [
        {
          name: "better-auth.session_token",
          value: "test-token-doctor",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ],
    });

    await expect(loginAsDoctorAction()).rejects.toThrow("NEXT_REDIRECT:/dashboard");

    expect(mockTestLogin).toHaveBeenCalledWith({
      userId: "user-doctor-1",
    });
    expect(mockCookieSet).toHaveBeenCalledWith(
      "better-auth.session_token",
      "test-token-doctor",
      expect.objectContaining({
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      })
    );
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("should log in as receptionist with seeded receptionist ID and redirect to /dashboard", async () => {
    mockTestLogin.mockResolvedValueOnce({
      session: { id: "s-2", userId: DEMO_PERSONAS.receptionist.userId },
      user: { id: DEMO_PERSONAS.receptionist.userId, name: DEMO_PERSONAS.receptionist.name },
      cookies: [
        {
          name: "better-auth.session_token",
          value: "test-token-receptionist",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ],
    });

    await expect(loginAsReceptionistAction()).rejects.toThrow("NEXT_REDIRECT:/dashboard");

    expect(mockTestLogin).toHaveBeenCalledWith({
      userId: "user-receptionist-1",
    });
    expect(mockCookieSet).toHaveBeenCalledWith(
      "better-auth.session_token",
      "test-token-receptionist",
      expect.objectContaining({
        path: "/",
        httpOnly: true,
      })
    );
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("should throw for invalid demo persona role", async () => {
    // @ts-expect-error testing invalid input at runtime
    await expect(loginAsDemoPersona("admin")).rejects.toThrow("Invalid demo persona: admin");
    expect(mockTestLogin).not.toHaveBeenCalled();
  });

  it("should delete session cookies and redirect to / on logoutSandboxAction", async () => {
    mockSignOut.mockResolvedValueOnce({ success: true });

    await expect(logoutSandboxAction()).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockCookieDelete).toHaveBeenCalledWith("better-auth.session_token");
    expect(mockCookieDelete).toHaveBeenCalledWith("better-auth.session_data");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});
