import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { loadSeedDataset } from "@/lib/dataset/loader";
import { lintDataset } from "@/lib/dataset/linter";

export async function GET() {
  await requireAdmin();

  try {
    const dataset = await loadSeedDataset();
    const issues = lintDataset(dataset);

    return NextResponse.json({
      issues,
      summary: {
        total: issues.length,
        errors: issues.filter((i) => i.severity === "error").length,
        warnings: issues.filter((i) => i.severity === "warning").length,
      },
    });
  } catch (error) {
    console.error("Lint error:", error);
    return NextResponse.json(
      { error: "Failed to lint dataset" },
      { status: 500 }
    );
  }
}
