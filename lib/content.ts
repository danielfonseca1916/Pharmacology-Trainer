/**
 * Content module - uses centralized dataset loader for efficient caching
 * The actual parsing happens in dataset-loader.ts which caches the result
 */

import casesRaw from "@/data/seed/cases.json" assert { type: "json" };
import courseBlocksRaw from "@/data/seed/courseBlocks.json" assert { type: "json" };
import doseTemplatesRaw from "@/data/seed/doseTemplates.json" assert { type: "json" };
import drugsRaw from "@/data/seed/drugs.json" assert { type: "json" };
import interactionsRaw from "@/data/seed/interactions.json" assert { type: "json" };
import questionsRaw from "@/data/seed/questions.json" assert { type: "json" };
import { z } from "zod";
import { datasetSchema } from "./schemas";

const parsed = z.object(datasetSchema).safeParse({
  courseBlocks: courseBlocksRaw,
  drugs: drugsRaw,
  questions: questionsRaw,
  cases: casesRaw,
  interactions: interactionsRaw,
  doseTemplates: doseTemplatesRaw,
});

if (!parsed.success) {
  console.error(parsed.error.format());
  throw new Error("Seed data failed validation");
}

export const content = parsed.data;

export function searchContent(term: string) {
  const q = term.toLowerCase();
  return {
    drugs: content.drugs.filter(
      (d) =>
        d.name.en.toLowerCase().includes(q) ||
        d.name.cs.toLowerCase().includes(q) ||
        d.class.en.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    ),
    questions: content.questions.filter(
      (item) =>
        item.stem.en.toLowerCase().includes(q) ||
        item.stem.cs.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    ),
    cases: content.cases.filter(
      (item) =>
        item.stem.en.toLowerCase().includes(q) ||
        item.stem.cs.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    ),
  };
}
