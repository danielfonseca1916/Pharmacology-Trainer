import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { validateDataset } from "@/lib/dataset/linter";
import { z } from "zod";

const importSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const rawName = formData.get("name") as string;
    const rawDescription = formData.get("description") as string;
    
    // Validate metadata
    const metaValidation = importSchema.safeParse({
      name: rawName || file?.name || "",
      description: rawDescription || "",
    });
    
    if (!metaValidation.success) {
      return NextResponse.json(
        { error: "Invalid metadata", details: metaValidation.error.errors },
        { status: 400 }
      );
    }
    
    const { name, description } = metaValidation.data;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON syntax" },
        { status: 400 }
      );
    }

    // Extract dataset from export format if present
    let dataset = data;
    if (
      typeof data === "object" &&
      data !== null &&
      "dataset" in data &&
      typeof (data as Record<string, unknown>).dataset === "object"
    ) {
      dataset = (data as Record<string, unknown>).dataset;
    }

    // Validate the dataset
    const validation = validateDataset(dataset);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Dataset validation failed",
          issues: validation.errors,
        },
        { status: 400 }
      );
    }

    // Store in database
    const override = await prisma.datasetOverride.create({
      data: {
        name: name || file.name,
        description: description || "",
        jsonText: JSON.stringify(dataset),
        createdById: parseInt(session.user?.id || "0"),
      },
    });

    return NextResponse.json({
      success: true,
      overrideId: override.id,
      message: "Dataset imported successfully",
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import dataset" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await requireAdmin();

  try {
    const overrides = await prisma.datasetOverride.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ overrides });
  } catch (error) {
    console.error("List overrides error:", error);
    return NextResponse.json(
      { error: "Failed to list overrides" },
      { status: 500 }
    );
  }
}
