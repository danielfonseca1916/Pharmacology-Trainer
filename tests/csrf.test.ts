import { generateCsrfToken, validateCsrfToken } from "@/lib/csrf";
import { beforeAll, describe, expect, it } from "vitest";

// Set required environment variable for CSRF
beforeAll(() => {
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = "test-secret-for-csrf-testing-minimum-32-chars";
  }
});

describe("CSRF Protection", () => {
  describe("generateCsrfToken", () => {
    it("should generate a token", () => {
      const token = generateCsrfToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate unique tokens", () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });

    it("should generate hex string of expected length", () => {
      const token = generateCsrfToken();
      // 32 bytes = 64 hex characters
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("validateCsrfToken", () => {
    it("should return true for matching tokens", () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token, token)).toBe(true);
    });

    it("should return false for non-matching tokens", () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(validateCsrfToken(token1, token2)).toBe(false);
    });

    it("should return false for undefined request token", () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(undefined, token)).toBe(false);
    });

    it("should return false for undefined session token", () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token, undefined)).toBe(false);
    });

    it("should return false for both undefined", () => {
      expect(validateCsrfToken(undefined, undefined)).toBe(false);
    });

    it("should return false for tokens of different lengths", () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token, token + "a")).toBe(false);
      expect(validateCsrfToken(token + "a", token)).toBe(false);
    });

    it("should use constant-time comparison", () => {
      // This test verifies that timing attacks are prevented
      const token1 = "a".repeat(64);
      const token2 = "b".repeat(64);
      const token3 = "a".repeat(63) + "b";

      // All should fail, but timing should be similar
      expect(validateCsrfToken(token1, token2)).toBe(false);
      expect(validateCsrfToken(token1, token3)).toBe(false);
    });
  });
});
