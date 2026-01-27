import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DatasetBundle } from "./schemas";

export async function loadJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function loadSeedDataset(): Promise<DatasetBundle> {
  const basePath = path.join(process.cwd(), "data/seed");
  
  const [courseBlocks, drugs, questions, cases, interactions, doseTemplates] = await Promise.all([
    loadJsonFile(path.join(basePath, "courseBlocks.json")),
    loadJsonFile(path.join(basePath, "drugs.json")),
    loadJsonFile(path.join(basePath, "questions.json")),
    loadJsonFile(path.join(basePath, "cases.json")),
    loadJsonFile(path.join(basePath, "interactions.json")),
    loadJsonFile(path.join(basePath, "doseTemplates.json")),
  ]);

  return {
    courseBlocks,
    drugs,
    questions,
    cases,
    interactions,
    doseTemplates,
  } as DatasetBundle;
}
