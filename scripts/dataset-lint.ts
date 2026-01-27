#!/usr/bin/env tsx
import { loadSeedDataset } from "@/lib/dataset/loader";
import { lintDataset } from "@/lib/dataset/linter";

async function main() {
  console.log("🔍 Loading dataset...");
  const dataset = await loadSeedDataset();

  console.log("✅ Dataset loaded");
  console.log(`   - courseBlocks: ${dataset.courseBlocks.length}`);
  console.log(`   - drugs: ${dataset.drugs.length}`);
  console.log(`   - questions: ${dataset.questions.length}`);
  console.log(`   - cases: ${dataset.cases.length}`);
  console.log(`   - interactions: ${dataset.interactions.length}`);
  console.log(`   - doseTemplates: ${dataset.doseTemplates.length}\n`);

  console.log("🔍 Running lint checks...\n");
  const issues = lintDataset(dataset);

  if (issues.length === 0) {
    console.log("✅ No issues found! Dataset is clean.\n");
    process.exit(0);
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  console.log(`❌ Found ${issues.length} issue(s):`);
  console.log(`   - ${errors.length} error(s)`);
  console.log(`   - ${warnings.length} warning(s)\n`);

  if (errors.length > 0) {
    console.log("🔴 ERRORS:");
    for (const issue of errors) {
      console.log(`   [${issue.type}] ${issue.message}`);
      if (issue.path) console.log(`      Path: ${issue.path}`);
      if (issue.id) console.log(`      ID: ${issue.id}`);
      if (issue.file) console.log(`      File: ${issue.file}`);
      console.log("");
    }
  }

  if (warnings.length > 0) {
    console.log("🟡 WARNINGS:");
    for (const issue of warnings) {
      console.log(`   [${issue.type}] ${issue.message}`);
      if (issue.path) console.log(`      Path: ${issue.path}`);
      if (issue.id) console.log(`      ID: ${issue.id}`);
      if (issue.file) console.log(`      File: ${issue.file}`);
      console.log("");
    }
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Lint failed:", err);
  process.exit(1);
});


if (import.meta.main) {
  const issues = lintDataset();
  if (issues.length === 0) {
    console.log("✅ Dataset lint passed");
    process.exit(0);
  }
  console.error("❌ Dataset lint found issues:");
  for (const issue of issues) console.error(`- [${issue.type}] ${issue.message}${issue.id ? ` (id=${issue.id})` : ""}`);
  process.exit(1);
}

export default lintDataset;
