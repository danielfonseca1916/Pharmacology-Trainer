import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = "demo@pharmtrainer.test";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Password123!", 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER",
        settings: { create: { language: "en" } },
      },
    });
    console.log("Seeded demo user", email);
  } else {
    console.log("Demo user already exists");
  }

  const adminEmail = "admin@pharmtrainer.test";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash("AdminPassword123!", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminHash,
        role: "ADMIN",
        settings: { create: { language: "en" } },
      },
    });
    console.log("Seeded admin user", adminEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
