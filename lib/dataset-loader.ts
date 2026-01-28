/**
 * Centralized dataset loader with server-side caching
 * Parses JSON data once and caches the result to avoid re-parsing on every request
 * Uses memoization to return the same cached object
 */

import casesRaw from "@/data/seed/cases.json" assert { type: "json" };
import courseBlocksRaw from "@/data/seed/courseBlocks.json" assert { type: "json" };
import doseTemplatesRaw from "@/data/seed/doseTemplates.json" assert { type: "json" };
import drugsRaw from "@/data/seed/drugs.json" assert { type: "json" };
import interactionsRaw from "@/data/seed/interactions.json" assert { type: "json" };
import questionsRaw from "@/data/seed/questions.json" assert { type: "json" };
import { z } from "zod";
import { datasetSchema } from "./schemas";

// Create the actual Zod schema from the dataset schema object
const fullDatasetSchema = z.object(datasetSchema);

export type CachedDataset = z.infer<typeof fullDatasetSchema>;

// In-memory cache for parsed dataset (server-side only)
let cachedDataset: CachedDataset | null = null;
let loadError: Error | null = null;

/**
 * Load and cache the dataset
 * Returns the same cached object on subsequent calls
 * @throws Error if validation fails
 */
export function getDataset(): CachedDataset {
  // Return cached dataset if already loaded
  if (cachedDataset) {
    return cachedDataset;
  }

  if (loadError) {
    throw loadError;
  }

  try {
    // Parse and validate dataset once
    const parsed = fullDatasetSchema.safeParse({
      courseBlocks: courseBlocksRaw,
      drugs: drugsRaw,
      questions: questionsRaw,
      cases: casesRaw,
      interactions: interactionsRaw,
      doseTemplates: doseTemplatesRaw,
    });

    if (!parsed.success) {
      const error = new Error("Seed data failed validation");
      loadError = error;
      throw error;
    }

    // Cache the parsed dataset
    cachedDataset = parsed.data;
    return cachedDataset;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    loadError = err;
    throw err;
  }
}

/**
 * Get dataset with error handling and optional fallback
 * @param fallback Optional fallback data to return on error
 * @returns Parsed dataset or fallback data if provided and error occurs
 */
export function getDatasetSafe(fallback?: CachedDataset): CachedDataset | undefined {
  try {
    return getDataset();
  } catch (error) {
    console.error("[DatasetLoader] Failed to load dataset:", error);
    return fallback;
  }
}

/**
 * Invalidate cache (useful for testing)
 */
export function invalidateCache(): void {
  cachedDataset = null;
  loadError = null;
}

/**
 * Check if dataset is cached
 */
export function isCached(): boolean {
  return cachedDataset !== null;
}

/**
 * Get cache stats for monitoring
 */
export function getCacheStats(): { cached: boolean; error: boolean } {
  return {
    cached: cachedDataset !== null,
    error: loadError !== null,
  };
}
