import { describe, it, expect } from "vitest";
import { content, searchContent } from "@/lib/content";

describe("Content Loading and Search", () => {
  it("loads all content correctly", () => {
    expect(content.courseBlocks.length).toBe(5);
    expect(content.drugs.length).toBeGreaterThan(0);
    expect(content.questions.length).toBe(10);
    expect(content.cases.length).toBe(5);
    expect(content.interactions.length).toBe(10);
  });

  it("searches drugs by name (EN)", () => {
    const results = searchContent("metoprolol");
    expect(results.drugs.length).toBeGreaterThan(0);
    expect(results.drugs[0].name.en.toLowerCase()).toContain("metoprolol");
  });

  it("searches drugs by name (CS)", () => {
    const results = searchContent("amlodipin");
    expect(results.drugs.length).toBeGreaterThan(0);
  });

  it("searches by tag", () => {
    const results = searchContent("beta-blocker");
    expect(results.drugs.length).toBeGreaterThan(0);
  });

  it("searches questions by stem", () => {
    const results = searchContent("beta-blocker");
    expect(results.questions.length).toBeGreaterThan(0);
    expect(results.questions.some(q => q.id === "q1")).toBe(true);
  });

  it("returns empty arrays for no matches", () => {
    const results = searchContent("xyzabc123nonexistent");
    expect(results.drugs.length).toBe(0);
    expect(results.questions.length).toBe(0);
  });
});
