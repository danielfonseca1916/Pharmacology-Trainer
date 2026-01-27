import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  entityType: z.enum(["question", "case", "calc"]),
  entityId: z.string(),
  module: z.string(),
  courseBlock: z.string(),
  tags: z.array(z.string()),
  answers: z.unknown(),
  score: z.number(),
  feedback: z.unknown(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { entityType, entityId, module, courseBlock, tags, answers, score, feedback } = parsed.data;

  const attempt = await prisma.attempt.create({
    data: {
      userId: Number(session.user.id),
      entityType,
      entityId,
      answers: JSON.stringify(answers),
      score,
      feedback: JSON.stringify(feedback),
    },
  });

  const isCorrect = score >= 50;
  await Promise.all(
    tags.map((tag) =>
      prisma.progressByTag.upsert({
        where: {
          userId_module_courseBlock_tag: {
            userId: Number(session.user.id),
            module,
            courseBlock,
            tag,
          },
        },
        update: {
          correctCount: { increment: isCorrect ? 1 : 0 },
          wrongCount: { increment: isCorrect ? 0 : 1 },
          lastAttemptAt: new Date(),
        },
        create: {
          userId: Number(session.user.id),
          module,
          courseBlock,
          tag,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
          lastAttemptAt: new Date(),
        },
      })
    )
  );

  return NextResponse.json({ ok: true, attempt });
}
