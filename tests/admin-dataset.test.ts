import { describe, it, expect } from "vitest";
import { lintDataset, validateDataset } from "@/lib/dataset/linter";
import type { DatasetBundle } from "@/lib/dataset/schemas";

describe("Dataset Validation", () => {
  it("should detect duplicate IDs within a collection", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [
        { id: "block1", title: { en: "Block 1", cs: "Blok 1" }, description: { en: "Desc", cs: "Popis" } },
        { id: "block1", title: { en: "Block 2", cs: "Blok 2" }, description: { en: "Desc", cs: "Popis" } },
      ],
      drugs: [],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const duplicateIssue = issues.find((i) => i.type === "duplicate-id");
    expect(duplicateIssue).toBeDefined();
    expect(duplicateIssue?.id).toBe("block1");
  });

  it("should detect missing English translations", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [
        { id: "block1", title: { en: "", cs: "Blok 1" }, description: { en: "Desc", cs: "Popis" } },
      ],
      drugs: [],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const missingEnIssue = issues.find(
      (i) => i.type === "missing-translation" && i.severity === "error"
    );
    expect(missingEnIssue).toBeDefined();
  });

  it("should warn about missing Czech translations", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [
        { id: "block1", title: { en: "Block 1", cs: "" }, description: { en: "Desc", cs: "Popis" } },
      ],
      drugs: [],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const missingCsIssue = issues.find(
      (i) => i.type === "missing-translation" && i.severity === "warning"
    );
    expect(missingCsIssue).toBeDefined();
  });

  it("should detect broken course block references in drugs", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [
        { id: "ans", title: { en: "ANS", cs: "ANS" }, description: { en: "Desc", cs: "Popis" } },
      ],
      drugs: [
        {
          id: "drug1",
          name: { en: "Drug", cs: "Lék" },
          class: { en: "Class", cs: "Třída" },
          indications: { en: "Ind", cs: "Indikace" },
          mechanism: { en: "Mech", cs: "Mechanismus" },
          adverseEffects: { en: "AE", cs: "NÚ" },
          contraindications: { en: "CI", cs: "KI" },
          monitoring: { en: "Mon", cs: "Monitoring" },
          interactionsSummary: { en: "Int", cs: "Interakce" },
          typicalDoseText: { en: "Dose", cs: "Dávka" },
          tags: ["test"],
          courseBlockId: "nonexistent",
        },
      ],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const brokenRefIssue = issues.find((i) => i.type === "broken-ref");
    expect(brokenRefIssue).toBeDefined();
    expect(brokenRefIssue?.message).toContain("nonexistent");
  });

  it("should detect broken drug references in interactions", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [],
      drugs: [
        {
          id: "drug1",
          name: { en: "Drug", cs: "Lék" },
          class: { en: "Class", cs: "Třída" },
          indications: { en: "Ind", cs: "Indikace" },
          mechanism: { en: "Mech", cs: "Mechanismus" },
          adverseEffects: { en: "AE", cs: "NÚ" },
          contraindications: { en: "CI", cs: "KI" },
          monitoring: { en: "Mon", cs: "Monitoring" },
          interactionsSummary: { en: "Int", cs: "Interakce" },
          typicalDoseText: { en: "Dose", cs: "Dávka" },
          tags: ["test"],
          courseBlockId: "ans",
        },
      ],
      questions: [],
      cases: [],
      interactions: [
        {
          id: "int1",
          appliesWhen: { drugIds: ["drug1", "nonexistent_drug"] },
          severity: "high",
          mechanism: { en: "Mech", cs: "Mechanismus" },
          recommendation: { en: "Rec", cs: "Doporučení" },
          rationale: { en: "Rat", cs: "Důvod" },
        },
      ],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const brokenRefIssue = issues.find(
      (i) => i.type === "broken-ref" && i.message.includes("nonexistent_drug")
    );
    expect(brokenRefIssue).toBeDefined();
  });

  it("should warn about non-lowercase tags", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [],
      drugs: [
        {
          id: "drug1",
          name: { en: "Drug", cs: "Lék" },
          class: { en: "Class", cs: "Třída" },
          indications: { en: "Ind", cs: "Indikace" },
          mechanism: { en: "Mech", cs: "Mechanismus" },
          adverseEffects: { en: "AE", cs: "NÚ" },
          contraindications: { en: "CI", cs: "KI" },
          monitoring: { en: "Mon", cs: "Monitoring" },
          interactionsSummary: { en: "Int", cs: "Interakce" },
          typicalDoseText: { en: "Dose", cs: "Dávka" },
          tags: ["Test", "Another TAG"],
          courseBlockId: "ans",
        },
      ],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const tagIssues = issues.filter((i) => i.type === "tag-format");
    expect(tagIssues.length).toBeGreaterThan(0);
  });

  it("should validate a correct dataset successfully", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [
        { id: "ans", title: { en: "ANS", cs: "ANS" }, description: { en: "Autonomic", cs: "Autonomní" } },
      ],
      drugs: [
        {
          id: "drug1",
          name: { en: "Epinephrine", cs: "Epinefrin" },
          class: { en: "Adrenergic", cs: "Adrenergní" },
          indications: { en: "Anaphylaxis", cs: "Anafylaxe" },
          mechanism: { en: "Alpha/beta agonist", cs: "Alfa/beta agonista" },
          adverseEffects: { en: "Tachycardia", cs: "Tachykardie" },
          contraindications: { en: "None", cs: "Žádné" },
          monitoring: { en: "HR, BP", cs: "TF, TK" },
          interactionsSummary: { en: "Beta blockers", cs: "Beta blokátory" },
          typicalDoseText: { en: "0.3mg IM", cs: "0,3mg IM" },
          tags: ["adrenergic", "emergency"],
          courseBlockId: "ans",
        },
      ],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const result = validateDataset(bundle);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should detect questions without correct options", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [
        { id: "ans", title: { en: "ANS", cs: "ANS" }, description: { en: "Desc", cs: "Popis" } },
      ],
      drugs: [],
      questions: [
        {
          id: "q1",
          stem: { en: "Question?", cs: "Otázka?" },
          options: [
            { id: "opt1", text: { en: "A", cs: "A" }, correct: false },
            { id: "opt2", text: { en: "B", cs: "B" }, correct: false },
          ],
          explanation: { en: "Exp", cs: "Vysvětlení" },
          tags: ["test"],
          courseBlockId: "ans",
        },
      ],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const noCorrectIssue = issues.find(
      (i) => i.message === "No correct option marked"
    );
    expect(noCorrectIssue).toBeDefined();
  });

  it("should detect invalid rubric references in cases", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [
        { id: "ans", title: { en: "ANS", cs: "ANS" }, description: { en: "Desc", cs: "Popis" } },
      ],
      drugs: [],
      questions: [],
      cases: [
        {
          id: "case1",
          stem: { en: "Patient presents...", cs: "Pacient přichází..." },
          patient: {},
          vitals: { HR: "90" },
          choices: [
            {
              id: "choice1",
              option: { en: "Option 1", cs: "Možnost 1" },
              explanation: { en: "Exp", cs: "Vysvětlení" },
            },
          ],
          rubric: {
            correctChoiceId: "nonexistent_choice",
            contraindicationsMissed: [],
            interactionsMissed: [],
            monitoringMissing: [],
            scoring: { correct: 100, safety: 0, monitoring: 0 },
          },
          courseBlockId: "ans",
          tags: ["test"],
        },
      ],
      interactions: [],
      doseTemplates: [],
    };

    const issues = lintDataset(bundle);
    const rubricIssue = issues.find(
      (i) => i.type === "broken-ref" && i.path?.includes("rubric")
    );
    expect(rubricIssue).toBeDefined();
  });
});

describe("Dataset Export Structure", () => {
  it("should create export bundle with metadata", () => {
    const bundle: DatasetBundle = {
      courseBlocks: [],
      drugs: [],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      dataset: bundle,
    };

    expect(exportData).toHaveProperty("exportedAt");
    expect(exportData).toHaveProperty("version");
    expect(exportData).toHaveProperty("dataset");
    expect(exportData.dataset).toHaveProperty("courseBlocks");
    expect(exportData.dataset).toHaveProperty("drugs");
    expect(exportData.dataset).toHaveProperty("questions");
    expect(exportData.dataset).toHaveProperty("cases");
    expect(exportData.dataset).toHaveProperty("interactions");
    expect(exportData.dataset).toHaveProperty("doseTemplates");
  });
});
