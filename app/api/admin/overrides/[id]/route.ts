import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const datasetOverrideSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  jsonText: z.string(),
  isActive: z.boolean().optional(),
});

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  try {
    const rawParams = await params;
    const id = parseInt(rawParams.id, 10);
    const session = await requireAdmin();

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const bodyText = await _request.text();
    const body = datasetOverrideSchema.parse(bodyText ? JSON.parse(bodyText) : {});

    const override = await prisma.datasetOverride.create({
      data: {
        name: body.name || `override-${id}`,
        description: body.description || "",
        jsonText: body.jsonText || "{}",
        isActive: body.isActive || false,
        createdById: parseInt(session.user.id, 10),
      },
    });

    return NextResponse.json(override);
  } catch (error) {
    console.error("Create override error:", error);
    return NextResponse.json({ error: "Failed to create override" }, { status: 500 });
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  try {
    const rawParams = await params;
    const id = parseInt(rawParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.datasetOverride.update({
      where: { id },
      data: { isActive: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activate error:", error);
    return NextResponse.json({ error: "Failed to activate override" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  try {
    const rawParams = await params;
    const id = parseInt(rawParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.datasetOverride.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete override" }, { status: 500 });
  }
}
