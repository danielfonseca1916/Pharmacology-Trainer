/**
 * Lightweight client-side search index builder
 * Pre-builds search indexes for fast filtering without re-parsing
 */

export interface SearchIndexItem {
  id: string;
  type: "drug" | "question" | "case";
  nameEn: string;
  nameCs: string;
  searchText: string; // Pre-tokenized searchable text
  tags: string[];
}

export interface SearchIndex {
  items: SearchIndexItem[];
  byId: Map<string, SearchIndexItem>;
  byType: Map<string, SearchIndexItem[]>;
  lastBuilt: number;
}

/**
 * Build search index from content
 * Pre-tokenizes and lowercases text for faster filtering
 */
export function buildSearchIndex(content: any): SearchIndex {
  const items: SearchIndexItem[] = [];
  const byId = new Map<string, SearchIndexItem>();
  const byType = new Map<string, SearchIndexItem[]>();

  // Add drugs
  if (content.drugs) {
    content.drugs.forEach((drug: any) => {
      const item: SearchIndexItem = {
        id: drug.id,
        type: "drug",
        nameEn: drug.name.en,
        nameCs: drug.name.cs,
        searchText: [
          drug.name.en,
          drug.name.cs,
          drug.class?.en || "",
          drug.class?.cs || "",
          drug.tags?.join(" ") || "",
        ]
          .join(" ")
          .toLowerCase(),
        tags: drug.tags || [],
      };
      items.push(item);
      byId.set(item.id, item);
      if (!byType.has("drug")) byType.set("drug", []);
      byType.get("drug")!.push(item);
    });
  }

  // Add questions
  if (content.questions) {
    content.questions.forEach((question: any) => {
      const item: SearchIndexItem = {
        id: question.id,
        type: "question",
        nameEn: question.stem?.en || "",
        nameCs: question.stem?.cs || "",
        searchText: [
          question.stem?.en || "",
          question.stem?.cs || "",
          question.tags?.join(" ") || "",
        ]
          .join(" ")
          .toLowerCase(),
        tags: question.tags || [],
      };
      items.push(item);
      byId.set(item.id, item);
      if (!byType.has("question")) byType.set("question", []);
      byType.get("question")!.push(item);
    });
  }

  // Add cases
  if (content.cases) {
    content.cases.forEach((caseItem: any) => {
      const item: SearchIndexItem = {
        id: caseItem.id,
        type: "case",
        nameEn: caseItem.stem?.en || "",
        nameCs: caseItem.stem?.cs || "",
        searchText: [
          caseItem.stem?.en || "",
          caseItem.stem?.cs || "",
          caseItem.tags?.join(" ") || "",
        ]
          .join(" ")
          .toLowerCase(),
        tags: caseItem.tags || [],
      };
      items.push(item);
      byId.set(item.id, item);
      if (!byType.has("case")) byType.set("case", []);
      byType.get("case")!.push(item);
    });
  }

  return {
    items,
    byId,
    byType,
    lastBuilt: Date.now(),
  };
}

/**
 * Search index using pre-built index
 * O(n) but with pre-tokenized text for minimal processing
 */
export function searchIndex(index: SearchIndex, term: string): SearchIndexItem[] {
  if (!term.trim()) return [];

  const q = term.toLowerCase().split(/\s+/).filter(Boolean);
  if (q.length === 0) return [];

  return index.items.filter((item) => {
    // Check if all query terms match
    return q.every((queryTerm) => item.searchText.includes(queryTerm));
  });
}

/**
 * Debounce function for search
 * Returns a debounced search function that calls callback after delay
 */
export function createDebouncedSearch(
  callback: (results: SearchIndexItem[]) => void,
  delay: number = 300
): (index: SearchIndex, term: string) => void {
  let timeoutId: NodeJS.Timeout;

  return (index: SearchIndex, term: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const results = searchIndex(index, term);
      callback(results);
    }, delay);
  };
}

/**
 * Get search statistics
 */
export function getSearchStats(index: SearchIndex): {
  totalItems: number;
  drugs: number;
  questions: number;
  cases: number;
  builtAt: number;
} {
  return {
    totalItems: index.items.length,
    drugs: index.byType.get("drug")?.length || 0,
    questions: index.byType.get("question")?.length || 0,
    cases: index.byType.get("case")?.length || 0,
    builtAt: index.lastBuilt,
  };
}
