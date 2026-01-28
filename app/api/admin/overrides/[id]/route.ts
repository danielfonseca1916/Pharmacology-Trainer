import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const datasetOverrideSchema = z.object({
  questionIds: z.array(z.number()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  active: z.boolean(),
});

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  try {
    const rawParams = await params;
    const id = parseInt(rawParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = datasetOverrideSchema.parse({});
    const override = await prisma.datasetOverride.create({
      data: {
        id,
        questionIds: body.questionIds || [],
        difficulty: body.difficulty,
        active: body.active,
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
      data: { active: true },
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
