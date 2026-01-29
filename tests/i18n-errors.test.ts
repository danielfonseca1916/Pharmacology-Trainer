import { cs } from "@/lib/i18n/cs";
import { en } from "@/lib/i18n/en";
import { describe, expect, it } from "vitest";

describe("i18n Error Messages", () => {
  describe("English (en)", () => {
    it("should have all error message keys", () => {
      expect(en.errors).toBeDefined();
      expect(en.errors.pageNotFound).toBe("Page Not Found");
      expect(en.errors.pageNotFoundMessage).toBeDefined();
      expect(en.errors.dataLoadError).toBe("Data Loading Error");
      expect(en.errors.dataLoadErrorMessage).toBeDefined();
      expect(en.errors.serverError).toBe("Server Error");
      expect(en.errors.serverErrorMessage).toBeDefined();
      expect(en.errors.unauthorized).toBe("Unauthorized");
      expect(en.errors.unauthorizedMessage).toBeDefined();
      expect(en.errors.sessionExpired).toBe("Session Expired");
      expect(en.errors.sessionExpiredMessage).toBeDefined();
    });

    it("should have action keys", () => {
      expect(en.errors.goHome).toBe("Go Home");
      expect(en.errors.reportIssue).toBe("Report Issue");
      expect(en.errors.retry).toBe("Retry");
    });
  });

  describe("Czech (cs)", () => {
    it("should have all error message keys", () => {
      expect(cs.errors).toBeDefined();
      expect(cs.errors.pageNotFound).toBe("Stránka nenalezena");
      expect(cs.errors.pageNotFoundMessage).toBeDefined();
      expect(cs.errors.dataLoadError).toBe("Chyba načítání dat");
      expect(cs.errors.dataLoadErrorMessage).toBeDefined();
      expect(cs.errors.serverError).toBe("Chyba serveru");
      expect(cs.errors.serverErrorMessage).toBeDefined();
      expect(cs.errors.unauthorized).toBe("Neautorizováno");
      expect(cs.errors.unauthorizedMessage).toBeDefined();
      expect(cs.errors.sessionExpired).toBe("Relace vypršela");
      expect(cs.errors.sessionExpiredMessage).toBeDefined();
    });

    it("should have action keys", () => {
      expect(cs.errors.goHome).toBe("Domů");
      expect(cs.errors.reportIssue).toBe("Nahlásit problém");
      expect(cs.errors.retry).toBe("Zkusit znovu");
    });
  });

  describe("Consistency", () => {
    it("should have same keys in both languages", () => {
      const enKeys = Object.keys(en.errors).sort();
      const csKeys = Object.keys(cs.errors).sort();
      expect(enKeys).toEqual(csKeys);
    });

    it("should have no empty strings", () => {
      Object.values(en.errors).forEach((value) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe("string");
        if (typeof value === "string") {
          expect(value.length).toBeGreaterThan(0);
        }
      });

      Object.values(cs.errors).forEach((value) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe("string");
        if (typeof value === "string") {
          expect(value.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
