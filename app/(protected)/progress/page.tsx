"use client";

import { auth } from "@/auth";
import { I18nProvider } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { ProgressTable } from "./progress-table";

export default async function ProgressPage() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  const items = await prisma.progressByTag.findMany({
    where: { userId: { equals: userId } },
    orderBy: [{ lastAttemptAt: "desc" }],
  });

  return (
    <I18nProvider>
      <ProgressTable items={items} />
    </I18nProvider>
  );
}
