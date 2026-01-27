#!/usr/bin/env tsx
import { loadSeedDataset } from "@/lib/dataset/loader";
import { validateDataset } from "@/lib/dataset/linter";

async function main() {
  console.log("🔍 Loading seed dataset...");
  const dataset = await loadSeedDataset();

  console.log("✅ Files loaded successfully\n");
  console.log("🔍 Validating against schemas...\n");

  const result = validateDataset(dataset);

  if (result.valid) {
    console.log("✅ Data validation passed\n");
    console.log("Dataset summary:");
    console.log(`   - courseBlocks: ${dataset.courseBlocks.length}`);
    console.log(`   - drugs: ${dataset.drugs.length}`);
    console.log(`   - questions: ${dataset.questions.length}`);
    console.log(`   - cases: ${dataset.cases.length}`);
    console.log(`   - interactions: ${dataset.interactions.length}`);
    console.log(`   - doseTemplates: ${dataset.doseTemplates.length}`);
    
    if (result.warnings.length > 0) {
      console.log(`\n⚠️  ${result.warnings.length} warning(s) found:`);
      for (const warn of result.warnings) {
        console.log(`   [${warn.type}] ${warn.message}`);
      }
    }
    
    process.exit(0);
  } else {
    console.error("❌ Data validation failed\n");
    console.error(`Found ${result.errors.length} error(s):\n`);
    
    for (const err of result.errors) {
      console.error(`   [${err.type}] ${err.message}`);
      if (err.path) console.error(`      Path: ${err.path}`);
      if (err.id) console.error(`      ID: ${err.id}`);
      console.error("");
    }
    
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});
