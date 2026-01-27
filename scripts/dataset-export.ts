#!/usr/bin/env tsx
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadSeedDataset } from "@/lib/dataset/loader";

async function main() {
  const dataset = await loadSeedDataset();
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    dataset,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `pharmacology-dataset-${timestamp}.json`;
  const exportDir = path.join(process.cwd(), "exports");
  const filePath = path.join(exportDir, filename);

  // Ensure exports directory exists
  try {
    await writeFile(filePath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Dataset exported to: ${filePath}`);
    console.log(`   - courseBlocks: ${dataset.courseBlocks.length}`);
    console.log(`   - drugs: ${dataset.drugs.length}`);
    console.log(`   - questions: ${dataset.questions.length}`);
    console.log(`   - cases: ${dataset.cases.length}`);
    console.log(`   - interactions: ${dataset.interactions.length}`);
    console.log(`   - doseTemplates: ${dataset.doseTemplates.length}`);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "ENOENT") {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(exportDir, { recursive: true });
      await writeFile(filePath, JSON.stringify(exportData, null, 2));
      console.log(`✅ Dataset exported to: ${filePath}`);
    } else {
      throw err;
    }
  }
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
