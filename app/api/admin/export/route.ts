import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { loadSeedDataset } from "@/lib/dataset/loader";

export async function GET() {
  await requireAdmin();

  try {
    const dataset = await loadSeedDataset();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      dataset,
    };

    const json = JSON.stringify(exportData, null, 2);
    
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="pharmacology-dataset-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export dataset" },
      { status: 500 }
    );
  }
}
