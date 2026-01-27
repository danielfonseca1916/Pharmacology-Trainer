import { describe, it, expect, vi, beforeEach } from "vitest";
import { validatePasswordStrength } from "@/lib/password-validation";
import { rateLimit } from "@/lib/rate-limit";

describe("Security Tests", () => {
  describe("Password Validation", () => {
    it("rejects passwords shorter than 8 characters", () => {
      const result = validatePasswordStrength("Pass1");
      expect(result.valid).toBe(false);
      expect(result.errors.en.some((e) => e.includes("8 characters"))).toBe(true);
    });

    it("rejects passwords without numbers", () => {
      const result = validatePasswordStrength("PasswordOnly");
      expect(result.valid).toBe(false);
      expect(result.errors.en.some((e) => e.includes("number"))).toBe(true);
    });

    it("rejects passwords without letters", () => {
      const result = validatePasswordStrength("12345678");
      expect(result.valid).toBe(false);
      expect(result.errors.en.some((e) => e.includes("letter"))).toBe(true);
    });

    it("rejects common password patterns", () => {
      const result = validatePasswordStrength("password123");
      expect(result.valid).toBe(false);
      expect(result.errors.en.some((e) => e.includes("common patterns"))).toBe(true);
    });

    it("accepts strong passwords", () => {
      const result = validatePasswordStrength("MySecure123Pass");
      expect(result.valid).toBe(true);
      expect(result.errors.en).toHaveLength(0);
    });

    it("provides bilingual error messages", () => {
      const result = validatePasswordStrength("weak");
      expect(result.errors.en.length).toBeGreaterThan(0);
      expect(result.errors.cs.length).toBeGreaterThan(0);
      expect(result.errors.en.length).toBe(result.errors.cs.length);
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      // Reset rate limiter state between tests
      vi.clearAllTimers();
    });

    it("allows requests within limit", () => {
      const limiter = rateLimit({ maxRequests: 5, windowMs: 60000 });
      
      const result1 = limiter.check("test-user");
      const result2 = limiter.check("test-user");
      const result3 = limiter.check("test-user");
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(2);
    });

    it("blocks requests exceeding limit", () => {
      const limiter = rateLimit({ maxRequests: 3, windowMs: 60000 });
      
      limiter.check("test-user");
      limiter.check("test-user");
      limiter.check("test-user");
      const result = limiter.check("test-user");
      
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("tracks different identifiers separately", () => {
      const limiter = rateLimit({ maxRequests: 2, windowMs: 60000 });
      
      const result1 = limiter.check("user1");
      const result2 = limiter.check("user2");
      const result3 = limiter.check("user1");
      const result4 = limiter.check("user2");
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(result4.success).toBe(true);
    });

    it("provides resetAt timestamp", () => {
      const limiter = rateLimit({ maxRequests: 5, windowMs: 60000 });
      const result = limiter.check("test-user");
      
      expect(result.resetAt).toBeGreaterThan(Date.now());
      expect(result.resetAt).toBeLessThanOrEqual(Date.now() + 60000);
    });
  });
});
