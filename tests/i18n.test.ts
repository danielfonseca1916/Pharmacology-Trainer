import { describe, it, expect } from "vitest";
import { getLangValue } from "@/lib/i18n";
import { en } from "@/lib/i18n/en";
import { cs } from "@/lib/i18n/cs";

describe("i18n Localization", () => {
  it("retrieves English text", () => {
    const text = getLangValue({ en: "Hello", cs: "Ahoj" }, "en");
    expect(text).toBe("Hello");
  });

  it("retrieves Czech text", () => {
    const text = getLangValue({ en: "Hello", cs: "Ahoj" }, "cs");
    expect(text).toBe("Ahoj");
  });

  it("has matching keys between EN and CS", () => {
    const enKeys = Object.keys(en);
    const csKeys = Object.keys(cs);
    expect(enKeys.sort()).toEqual(csKeys.sort());
  });

  it("provides module names in both languages", () => {
    expect(en.modules.questionBank).toBeTruthy();
    expect(cs.modules.questionBank).toBeTruthy();
    expect(en.modules.caseReasoning).toBeTruthy();
    expect(cs.modules.caseReasoning).toBeTruthy();
  });

  it("provides disclaimer text in both languages", () => {
    expect(en.disclaimer.title).toBeTruthy();
    expect(cs.disclaimer.title).toBeTruthy();
    expect(en.disclaimer.clinicalWarning).toBeTruthy();
    expect(cs.disclaimer.clinicalWarning).toBeTruthy();
  });
});
