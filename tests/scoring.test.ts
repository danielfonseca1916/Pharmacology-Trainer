import { describe, it, expect } from "vitest";
import { content } from "@/lib/content";

describe("Scoring & Case Logic", () => {
  it("calculates case scoring correctly", () => {
    const case_ = content.cases[0];
    expect(case_).toBeDefined();
    expect(case_.rubric.scoring.correct).toBeGreaterThan(0);
    expect(case_.rubric.scoring.safety).toBeGreaterThan(0);
    const total = case_.rubric.scoring.correct + case_.rubric.scoring.safety + case_.rubric.scoring.monitoring;
    expect(total).toBeGreaterThan(0);
  });

  it("identifies correct choice in cases", () => {
    const case_ = content.cases[0];
    expect(case_.choices.some((c) => c.id === case_.rubric.correctChoiceId)).toBe(true);
  });

  it("tracks missed contraindications", () => {
    const case_ = content.cases[0];
    expect(Array.isArray(case_.rubric.contraindicationsMissed)).toBe(true);
  });

  it("tracks missed interactions", () => {
    const case_ = content.cases[0];
    expect(Array.isArray(case_.rubric.interactionsMissed)).toBe(true);
  });

  it("validates interaction rules have severity", () => {
    const interaction = content.interactions[0];
    expect(["low", "moderate", "high"]).toContain(interaction.severity);
  });
});
