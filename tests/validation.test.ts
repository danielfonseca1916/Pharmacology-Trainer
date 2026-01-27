import { describe, it, expect } from "vitest";
import { 
  courseBlockSchema, 
  drugSchema, 
  questionSchema, 
  interactionRuleSchema, 
  doseTemplateSchema 
} from "@/lib/schemas";

describe("Data Validation with Schema Definitions", () => {
  it("courseBlocks schema accepts valid bilingual object", () => {
    const courseBlock = {
      id: "block-test",
      title: { en: "Test Block", cs: "Testovací blok" },
      description: { en: "Description", cs: "Popis" },
    };
    const result = courseBlockSchema.safeParse(courseBlock);
    expect(result.success).toBe(true);
  });

  it("drugs schema requires all bilingual fields", () => {
    const incompleteDrug = {
      id: "drug-test",
      name: { en: "Test" },  // Missing 'cs'
      class: { en: "Test" },
      indications: { en: "Test" },
      mechanism: { en: "Test" },
      adverseEffects: { en: "Test" },
      contraindications: { en: "Test" },
      monitoring: { en: "Test" },
      interactionsSummary: { en: "Test" },
      typicalDoseText: { en: "Test" },
      tags: [],
      courseBlockId: "block-cv",
    };
    const result = drugSchema.safeParse(incompleteDrug);
    expect(result.success).toBe(false);
  });

  it("questions schema requires minimum 2 options and one correct", () => {
    const validQuestion = {
      id: "q-test",
      stem: { en: "Question?", cs: "Otázka?" },
      options: [
        { id: "a", text: { en: "Option A", cs: "Možnost A" }, correct: true },
        { id: "b", text: { en: "Option B", cs: "Možnost B" }, correct: false },
      ],
      explanation: { en: "Because", cs: "Protože" },
      tags: ["test"],
      courseBlockId: "block-cv",
    };
    const result = questionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it("rejects invalid severity in interactions", () => {
    const invalidInteraction = {
      id: "int-test",
      appliesWhen: { drugIds: [] },
      severity: "super-high",  // Invalid
      mechanism: { en: "Test", cs: "Test" },
      recommendation: { en: "Test", cs: "Test" },
      rationale: { en: "Test", cs: "Test" },
    };
    const result = interactionRuleSchema.safeParse(invalidInteraction);
    expect(result.success).toBe(false);
  });

  it("validates dose template input types", () => {
    const validTemplate = {
      id: "dose-test",
      title: { en: "Aminoglycoside", cs: "Aminoglykosid" },
      inputs: [
        { name: "weight", label: { en: "Weight (kg)", cs: "Hmotnost (kg)" }, type: "number" },
      ],
      formula: { en: "weight * 7", cs: "váha * 7" },
      example: { en: "70 kg → 490 mg", cs: "70 kg → 490 mg" },
      tags: ["mg/kg"],
    };
    const result = doseTemplateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
  });
});
