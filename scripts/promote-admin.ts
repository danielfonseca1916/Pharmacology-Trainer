#!/usr/bin/env tsx
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv.find((arg) => arg.startsWith("--email="))?.split("=")[1];
  
  if (!email) {
    console.error("Usage: pnpm admin:promote --email=user@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  
  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`ℹ️  User ${email} is already an ADMIN`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log(`✅ User ${email} promoted to ADMIN`);
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
