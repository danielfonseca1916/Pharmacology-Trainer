import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { validateDataset } from "@/lib/dataset/linter";
import type { FileValidationResult } from "@/lib/dataset/types";

export async function POST(req: NextRequest) {
  await requireAdmin();

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const results: FileValidationResult[] = [];

    for (const file of files) {
      const text = await file.text();
      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        results.push({
          file: file.name,
          valid: false,
          errors: [
            {
              type: "schema",
              severity: "error",
              message: "Invalid JSON syntax",
              file: file.name,
            },
          ],
          warnings: [],
        });
        continue;
      }

      // If it's a full bundle, validate as-is
      if (
        typeof data === "object" &&
        data !== null &&
        ("courseBlocks" in data ||
          "drugs" in data ||
          "questions" in data ||
          "cases" in data ||
          "interactions" in data ||
          "doseTemplates" in data)
      ) {
        const validation = validateDataset(data);
        results.push({
          file: file.name,
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      } else if (Array.isArray(data)) {
        // Single collection file (e.g., drugs.json)
        // Wrap it in a minimal bundle for validation
        const entityType = file.name.replace(".json", "");
        const bundle: Record<string, unknown> = {
          courseBlocks: entityType === "courseBlocks" ? data : [],
          drugs: entityType === "drugs" ? data : [],
          questions: entityType === "questions" ? data : [],
          cases: entityType === "cases" ? data : [],
          interactions: entityType === "interactions" ? data : [],
          doseTemplates: entityType === "doseTemplates" ? data : [],
        };

        const validation = validateDataset(bundle);
        results.push({
          file: file.name,
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      } else {
        results.push({
          file: file.name,
          valid: false,
          errors: [
            {
              type: "schema",
              severity: "error",
              message: "Expected an array or dataset bundle object",
              file: file.name,
            },
          ],
          warnings: [],
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate files" },
      { status: 500 }
    );
  }
}
