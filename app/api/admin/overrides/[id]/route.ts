import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID format"),
});

export async function POST({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  try {
    const rawParams = await params;

    // Validate ID parameter
    const validation = idSchema.safeParse(rawParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { id } = validation.data;
    const idNum = parseInt(id);

    // Deactivate all other overrides
    await prisma.datasetOverride.updateMany({
      data: { isActive: false },
    });

    // Activate this one
    await prisma.datasetOverride.update({
      where: { id: idNum },
      data: { isActive: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activate error:", error);
    return NextResponse.json({ error: "Failed to activate override" }, { status: 500 });
  }
}

export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  try {
    const rawParams = await params;

    // Validate ID parameter
    const validation = idSchema.safeParse(rawParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { id } = validation.data;
    const idNum = parseInt(id);

    await prisma.datasetOverride.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete override" }, { status: 500 });
  }
}
