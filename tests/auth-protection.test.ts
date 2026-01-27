import { describe, it, expect, vi, beforeEach } from "vitest";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { auth } from "@/auth";

// Mock dependencies
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

describe("Auth Protection Tests", () => {
  const mockAuth = vi.mocked(auth);
  const mockRedirect = vi.mocked(redirect);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAdmin middleware", () => {
    it("redirects to login when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      mockRedirect.mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });

    it("redirects to dashboard when user is not an admin", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "1",
          email: "user@test.com",
          role: "USER",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });
      mockRedirect.mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("allows admin users to proceed", async () => {
      const mockSession = {
        user: {
          id: "1",
          email: "admin@test.com",
          role: "ADMIN",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireAdmin();
      
      expect(result).toEqual(mockSession);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("handles missing user object", async () => {
      mockAuth.mockResolvedValue({
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as never);
      mockRedirect.mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("Route Protection Scenarios", () => {
    it("blocks regular users from admin routes", async () => {
      const userSession = {
        user: {
          id: "2",
          email: "regular@test.com",
          role: "USER",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(userSession);
      mockRedirect.mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("allows admin access to protected routes", async () => {
      const adminSession = {
        user: {
          id: "1",
          email: "admin@test.com",
          role: "ADMIN",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(adminSession);

      const result = await requireAdmin();
      
      expect(result.user.role).toBe("ADMIN");
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
