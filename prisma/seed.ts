import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface SeedConfig {
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  language?: string;
}

const DEFAULT_USERS: SeedConfig[] = [
  {
    email: "demo@pharmtrainer.test",
    password: "Password123!",
    role: "USER",
    language: "en",
  },
  {
    email: "admin@pharmtrainer.test",
    password: "AdminPassword123!",
    role: "ADMIN",
    language: "en",
  },
];

async function seedUsers(users: SeedConfig[]) {
  console.log(`[Seed] Starting user seeding for ${users.length} users...`);

  for (const userConfig of users) {
    const passwordHash = await bcrypt.hash(userConfig.password, 10);

    // Use upsert to make it idempotent - won't fail on re-run
    const user = await prisma.user.upsert({
      where: { email: userConfig.email },
      update: {
        // Only update password, preserve existing role
        passwordHash,
      },
      create: {
        email: userConfig.email,
        passwordHash,
        role: userConfig.role,
        settings: {
          create: {
            language: userConfig.language || "en",
          },
        },
      },
      include: { settings: true },
    });

    const isNew = user.createdAt.getTime() === user.createdAt.getTime();
    console.log(`[Seed] ${isNew ? "Created" : "Updated"} user: ${user.email} (${user.role})`);
  }
}

async function seedProgress(userId: number) {
  console.log(`[Seed] Seeding progress data for user ${userId}...`);

  const progressData = [
    { module: "questions", courseBlock: "cardiology", tag: "arrhythmias" },
    { module: "questions", courseBlock: "cardiology", tag: "hypertension" },
    { module: "cases", courseBlock: "pulmonary", tag: "asthma" },
    { module: "calculations", courseBlock: "pharmacokinetics", tag: "dosing" },
  ];

  for (const data of progressData) {
    await prisma.progressByTag.upsert({
      where: {
        userId_module_courseBlock_tag: {
          userId,
          module: data.module,
          courseBlock: data.courseBlock,
          tag: data.tag,
        },
      },
      update: {
        // Update to current timestamp on re-seed
        lastAttemptAt: new Date(),
      },
      create: {
        userId,
        ...data,
        correctCount: 0,
        wrongCount: 0,
        lastAttemptAt: new Date(),
      },
    });
  }

  console.log(`[Seed] Progress data seeded successfully`);
}

async function main() {
  console.log("[Seed] Database seeding started...");
  console.log(`[Seed] Environment: ${process.env.NODE_ENV || "development"}`);

  try {
    // Seed users (idempotent)
    await seedUsers(DEFAULT_USERS);

    // Seed progress data for demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@pharmtrainer.test" },
    });

    if (demoUser) {
      await seedProgress(demoUser.id);
    }

    // Verify seed results
    const userCount = await prisma.user.count();
    const progressCount = await prisma.progressByTag.count();

    console.log("[Seed] Seeding completed successfully!");
    console.log(`[Seed] Database summary: ${userCount} users, ${progressCount} progress records`);
  } catch (error) {
    console.error("[Seed] Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("[Seed] Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
