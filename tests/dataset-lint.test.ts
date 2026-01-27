import { describe, it, expect } from "vitest";
import { lintDataset } from "@/lib/dataset/linter";
import courseBlocksRaw from "@/data/seed/courseBlocks.json";
import drugsRaw from "@/data/seed/drugs.json";
import questionsRaw from "@/data/seed/questions.json";
import casesRaw from "@/data/seed/cases.json";
import interactionsRaw from "@/data/seed/interactions.json";
import doseTemplatesRaw from "@/data/seed/doseTemplates.json";

describe("Dataset Lint", () => {
  it("passes on current seed dataset", () => {
    const dataset = {
      courseBlocks: courseBlocksRaw,
      drugs: drugsRaw,
      questions: questionsRaw,
      cases: casesRaw,
      interactions: interactionsRaw,
      doseTemplates: doseTemplatesRaw,
    } as const;
    const issues = lintDataset(dataset as unknown as { courseBlocks: unknown; drugs: unknown; questions: unknown; cases: unknown; interactions: unknown; doseTemplates: unknown });
    expect(issues.length).toBe(0);
  });
});
