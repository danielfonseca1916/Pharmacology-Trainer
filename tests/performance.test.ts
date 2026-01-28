import {
  getCacheStats,
  getDataset,
  getDatasetSafe,
  invalidateCache,
  isCached,
} from "@/lib/dataset-loader";
import { buildPaginationQuery, paginate, parsePaginationParams } from "@/lib/pagination";
import { buildSearchIndex, getSearchStats, searchIndex } from "@/lib/search-index";
import { beforeEach, describe, expect, it } from "vitest";

describe("Performance: Dataset Loader", () => {
  beforeEach(() => {
    invalidateCache();
  });

  it("should cache dataset after first load", () => {
    // First load
    const dataset1 = getDataset();
    expect(isCached()).toBe(true);

    // Second load returns same cached instance
    const dataset2 = getDataset();
    expect(dataset1).toBe(dataset2); // Same object reference
  });

  it("should not call parsing logic multiple times", () => {
    const dataset1 = getDataset();
    const stats1 = getCacheStats();
    expect(stats1.cached).toBe(true);
    expect(stats1.error).toBe(false);

    // Get dataset multiple times
    const dataset2 = getDataset();
    const dataset3 = getDataset();
    const dataset4 = getDataset();

    // All should be the same reference (no re-parsing)
    expect(dataset1).toBe(dataset2);
    expect(dataset2).toBe(dataset3);
    expect(dataset3).toBe(dataset4);
  });

  it("should provide safe access with fallback", () => {
    const fallback = {
      courseBlocks: [],
      drugs: [],
      questions: [],
      cases: [],
      interactions: [],
      doseTemplates: [],
    };
    const dataset = getDatasetSafe(fallback);
    expect(dataset).toBeDefined();
    expect(dataset?.drugs).toBeDefined();
  });

  it("should allow cache invalidation for testing", () => {
    const dataset1 = getDataset();
    expect(isCached()).toBe(true);

    invalidateCache();
    expect(isCached()).toBe(false);

    const dataset2 = getDataset();
    // After invalidation and reload, should be different object
    expect(dataset1).not.toBe(dataset2);
    // But same content
    expect(dataset1.drugs.length).toBe(dataset2.drugs.length);
  });

  it("should report cache stats", () => {
    expect(getCacheStats().cached).toBe(false);
    expect(getCacheStats().error).toBe(false);

    getDataset();
    expect(getCacheStats().cached).toBe(true);
    expect(getCacheStats().error).toBe(false);
  });
});

describe("Performance: Pagination", () => {
  it("should paginate array correctly", () => {
    const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);

    const page1 = paginate(items, 1, 10);
    expect(page1.items.length).toBe(10);
    expect(page1.page).toBe(1);
    expect(page1.total).toBe(25);
    expect(page1.totalPages).toBe(3);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.hasPrevPage).toBe(false);

    const page2 = paginate(items, 2, 10);
    expect(page2.items.length).toBe(10);
    expect(page2.hasNextPage).toBe(true);
    expect(page2.hasPrevPage).toBe(true);

    const page3 = paginate(items, 3, 10);
    expect(page3.items.length).toBe(5);
    expect(page3.hasNextPage).toBe(false);
    expect(page3.hasPrevPage).toBe(true);
  });

  it("should handle invalid page numbers", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);

    const invalidPage = paginate(items, -1, 10);
    expect(invalidPage.page).toBe(1);

    const zeroPage = paginate(items, 0, 10);
    expect(zeroPage.page).toBe(1);
  });

  it("should limit page size to 100", () => {
    const items = Array.from({ length: 500 }, (_, i) => i);

    const result = paginate(items, 1, 200);
    expect(result.pageSize).toBe(100);
  });

  it("should parse pagination params from search params", () => {
    const params = new URLSearchParams("page=2&pageSize=20");
    const result = parsePaginationParams(params);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(20);
  });

  it("should build pagination query string", () => {
    const query1 = buildPaginationQuery(1, 10);
    expect(query1).toBe(""); // Default params not included

    const query2 = buildPaginationQuery(2, 10);
    expect(query2).toContain("page=2");

    const query3 = buildPaginationQuery(1, 20);
    expect(query3).toContain("pageSize=20");
  });
});

describe("Performance: Search Index", () => {
  it("should build search index from content", () => {
    const content = {
      drugs: [
        {
          id: "d1",
          name: { en: "Aspirin", cs: "Aspirin" },
          class: { en: "NSAID", cs: "NSAID" },
          tags: ["pain"],
        },
        {
          id: "d2",
          name: { en: "Ibuprofen", cs: "Ibuprofen" },
          class: { en: "NSAID", cs: "NSAID" },
          tags: ["pain", "fever"],
        },
      ],
      questions: [{ id: "q1", stem: { en: "What is...", cs: "Co je..." }, tags: ["anatomy"] }],
      cases: [
        {
          id: "c1",
          stem: { en: "Patient presents...", cs: "Pacient se hlásí..." },
          tags: ["clinical"],
        },
      ],
    };

    const index = buildSearchIndex(content);
    expect(index.items.length).toBe(4);
    expect(index.byType.get("drug")?.length).toBe(2);
    expect(index.byType.get("question")?.length).toBe(1);
    expect(index.byType.get("case")?.length).toBe(1);
  });

  it("should search index efficiently", () => {
    const content = {
      drugs: [
        {
          id: "d1",
          name: { en: "Aspirin", cs: "Aspirin" },
          class: { en: "NSAID", cs: "NSAID" },
          tags: ["pain"],
        },
        {
          id: "d2",
          name: { en: "Ibuprofen", cs: "Ibuprofen" },
          class: { en: "NSAID", cs: "NSAID" },
          tags: ["pain", "fever"],
        },
        {
          id: "d3",
          name: { en: "Acetaminophen", cs: "Paracetamol" },
          class: { en: "Analgesic", cs: "Analgetikum" },
          tags: ["pain"],
        },
      ],
      questions: [],
      cases: [],
    };

    const index = buildSearchIndex(content);

    // Search for "pain"
    const painResults = searchIndex(index, "pain");
    expect(painResults.length).toBe(3);

    // Search for "NSAID"
    const nsaidResults = searchIndex(index, "nsaid");
    expect(nsaidResults.length).toBe(2);

    // Search for "aspirin"
    const aspirinResults = searchIndex(index, "aspirin");
    expect(aspirinResults.length).toBe(1);

    // Empty search returns empty
    const emptyResults = searchIndex(index, "");
    expect(emptyResults.length).toBe(0);
  });

  it("should provide search statistics", () => {
    const content = {
      drugs: [
        {
          id: "d1",
          name: { en: "Drug1", cs: "Drug1" },
          class: { en: "Class", cs: "Class" },
          tags: [],
        },
        {
          id: "d2",
          name: { en: "Drug2", cs: "Drug2" },
          class: { en: "Class", cs: "Class" },
          tags: [],
        },
      ],
      questions: [{ id: "q1", stem: { en: "Q1", cs: "Q1" }, tags: [] }],
      cases: [],
    };

    const index = buildSearchIndex(content);
    const stats = getSearchStats(index);

    expect(stats.totalItems).toBe(3);
    expect(stats.drugs).toBe(2);
    expect(stats.questions).toBe(1);
    expect(stats.cases).toBe(0);
    expect(stats.builtAt).toBeGreaterThan(0);
  });

  it("should pre-tokenize search text for performance", () => {
    const content = {
      drugs: [
        {
          id: "d1",
          name: { en: "Acetylsalicylic Acid", cs: "Kyselina acetylsalicylová" },
          class: { en: "NSAID", cs: "NSAID" },
          tags: [],
        },
      ],
      questions: [],
      cases: [],
    };

    const index = buildSearchIndex(content);

    // Should find by partial word match
    const results1 = searchIndex(index, "acetyl");
    expect(results1.length).toBe(1);

    const results2 = searchIndex(index, "salicylic");
    expect(results2.length).toBe(1);

    const results3 = searchIndex(index, "acetyl salicylic");
    expect(results3.length).toBe(1);

    const results4 = searchIndex(index, "unknown");
    expect(results4.length).toBe(0);
  });
});
