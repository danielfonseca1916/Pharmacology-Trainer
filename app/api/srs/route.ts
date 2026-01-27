import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  easeFactor: z.number().min(1.3).max(2.5),
  intervalDays: z.number().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { entityType, entityId, easeFactor, intervalDays } = parsed.data;
  const now = new Date();
  const item = await prisma.spacedRepetitionItem.upsert({
    where: {
      userId_entityType_entityId: {
        userId: Number(session.user.id),
        entityType,
        entityId,
      },
    },
    update: {
      easeFactor,
      intervalDays,
      lastReviewedAt: now,
      nextReviewAt: new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000),
    },
    create: {
      userId: Number(session.user.id),
      entityType,
      entityId,
      easeFactor,
      intervalDays,
      lastReviewedAt: now,
      nextReviewAt: new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ ok: true, item });
}
