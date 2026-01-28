import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Database Schema", () => {
  // Test user data
  const testEmail = "test-schema@pharmtrainer.test";
  const testPassword = "TestPassword123!";
  let testUserId: number;

  beforeAll(async () => {
    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  describe("User Model", () => {
    it("should enforce unique email constraint", async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);

      // Create first user
      const user1 = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash,
          role: "USER",
        },
      });
      testUserId = user1.id;

      expect(user1.email).toBe(testEmail);
      expect(user1.role).toBe("USER");

      // Try to create duplicate - should fail
      await expect(
        prisma.user.create({
          data: {
            email: testEmail,
            passwordHash,
            role: "USER",
          },
        })
      ).rejects.toThrow();
    });

    it("should support role-based access control", async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const adminEmail = "admin-test@pharmtrainer.test";

      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: "ADMIN",
        },
      });

      expect(adminUser.role).toBe("ADMIN");

      // Clean up
      await prisma.user.delete({ where: { id: adminUser.id } });
    });
  });

  describe("Attempt Model with Indexes", () => {
    it("should create and query attempts with userId and createdAt index", async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: `attempt-test-${Date.now()}@pharmtrainer.test`,
          passwordHash,
          role: "USER",
        },
      });

      // Create test attempts
      const attempt1 = await prisma.attempt.create({
        data: {
          userId: user.id,
          entityType: "question",
          entityId: "q123",
          answers: { selected: "A" },
          score: 100,
          feedback: { correct: true },
        },
      });

      const attempt2 = await prisma.attempt.create({
        data: {
          userId: user.id,
          entityType: "question",
          entityId: "q124",
          answers: { selected: "B" },
          score: 85,
          feedback: { correct: true },
        },
      });

      // Query by userId and createdAt - should use index
      const attempts = await prisma.attempt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      expect(attempts).toHaveLength(2);
      expect(attempts[0].id).toBe(attempt2.id);

      // Clean up
      await prisma.attempt.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it("should handle various AttemptEntityType values", async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: `attempt-type-test-${Date.now()}@pharmtrainer.test`,
          passwordHash,
          role: "USER",
        },
      });

      const types = ["question", "case", "calc"] as const;

      for (const type of types) {
        const attempt = await prisma.attempt.create({
          data: {
            userId: user.id,
            entityType: type,
            entityId: `${type}-001`,
            answers: {},
            score: 100,
            feedback: {},
          },
        });

        expect(attempt.entityType).toBe(type);
      }

      // Clean up
      await prisma.attempt.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe("ProgressByTag Model with Constraints", () => {
    it("should enforce unique constraint on (userId, module, courseBlock, tag)", async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: `progress-test-${Date.now()}@pharmtrainer.test`,
          passwordHash,
          role: "USER",
        },
      });

      // Create progress entry
      const progress1 = await prisma.progressByTag.create({
        data: {
          userId: user.id,
          module: "questions",
          courseBlock: "cardiology",
          tag: "hypertension",
          correctCount: 5,
          wrongCount: 2,
        },
      });

      expect(progress1.userId).toBe(user.id);

      // Try to create duplicate - should fail
      await expect(
        prisma.progressByTag.create({
          data: {
            userId: user.id,
            module: "questions",
            courseBlock: "cardiology",
            tag: "hypertension",
            correctCount: 3,
            wrongCount: 1,
          },
        })
      ).rejects.toThrow();

      // Can create same module/courseBlock/tag for different user
      const user2 = await prisma.user.create({
        data: {
          email: `progress-test-2-${Date.now()}@pharmtrainer.test`,
          passwordHash,
          role: "USER",
        },
      });

      const progress2 = await prisma.progressByTag.create({
        data: {
          userId: user2.id,
          module: "questions",
          courseBlock: "cardiology",
          tag: "hypertension",
          correctCount: 10,
          wrongCount: 1,
        },
      });

      expect(progress2.userId).not.toBe(progress1.userId);

      // Clean up
      await prisma.progressByTag.deleteMany({
        where: {
          OR: [{ userId: user.id }, { userId: user2.id }],
        },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [user.id, user2.id] } },
      });
    });

    it("should query progress data efficiently with indexed fields", async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: `progress-query-test-${Date.now()}@pharmtrainer.test`,
          passwordHash,
          role: "USER",
        },
      });

      // Create multiple progress records
      await prisma.progressByTag.createMany({
        data: [
          {
            userId: user.id,
            module: "questions",
            courseBlock: "cardiology",
            tag: "arrhythmias",
            correctCount: 5,
            wrongCount: 1,
          },
          {
            userId: user.id,
            module: "questions",
            courseBlock: "cardiology",
            tag: "hypertension",
            correctCount: 8,
            wrongCount: 2,
          },
          {
            userId: user.id,
            module: "cases",
            courseBlock: "pulmonary",
            tag: "asthma",
            correctCount: 3,
            wrongCount: 0,
          },
        ],
      });

      // Query by indexed fields
      const cardiology = await prisma.progressByTag.findMany({
        where: {
          userId: user.id,
          module: "questions",
          courseBlock: "cardiology",
        },
      });

      expect(cardiology).toHaveLength(2);

      const specificTag = await prisma.progressByTag.findUnique({
        where: {
          userId_module_courseBlock_tag: {
            userId: user.id,
            module: "questions",
            courseBlock: "cardiology",
            tag: "hypertension",
          },
        },
      });

      expect(specificTag?.correctCount).toBe(8);

      // Clean up
      await prisma.progressByTag.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe("Database Seeding", () => {
    it("should verify seed creates demo and admin users", async () => {
      const demoUser = await prisma.user.findUnique({
        where: { email: "demo@pharmtrainer.test" },
        include: { settings: true },
      });

      expect(demoUser).toBeDefined();
      expect(demoUser?.role).toBe("USER");
      expect(demoUser?.settings?.language).toBe("en");

      const adminUser = await prisma.user.findUnique({
        where: { email: "admin@pharmtrainer.test" },
        include: { settings: true },
      });

      expect(adminUser).toBeDefined();
      expect(adminUser?.role).toBe("ADMIN");
    });

    it("should verify seed creates progress data for demo user", async () => {
      const demoUser = await prisma.user.findUnique({
        where: { email: "demo@pharmtrainer.test" },
      });

      if (demoUser) {
        const progressCount = await prisma.progressByTag.count({
          where: { userId: demoUser.id },
        });

        expect(progressCount).toBeGreaterThan(0);

        // Check specific progress entry
        const progress = await prisma.progressByTag.findFirst({
          where: { userId: demoUser.id },
        });

        expect(progress?.correctCount).toBeDefined();
        expect(progress?.wrongCount).toBeDefined();
      }
    });
  });

  describe("Cascade Delete", () => {
    it("should cascade delete related records when user is deleted", async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const user = await prisma.user.create({
        data: {
          email: `cascade-test-${Date.now()}@pharmtrainer.test`,
          passwordHash,
          role: "USER",
          settings: {
            create: {
              language: "cs",
            },
          },
        },
        include: { settings: true },
      });

      // Create related records
      await prisma.attempt.create({
        data: {
          userId: user.id,
          entityType: "question",
          entityId: "q1",
          answers: {},
          score: 100,
          feedback: {},
        },
      });

      await prisma.progressByTag.create({
        data: {
          userId: user.id,
          module: "test",
          courseBlock: "test",
          tag: "test",
        },
      });

      // Delete user
      await prisma.user.delete({ where: { id: user.id } });

      // Verify cascading deletes
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: user.id },
      });

      expect(userSettings).toBeNull();

      const attempts = await prisma.attempt.findMany({
        where: { userId: user.id },
      });

      expect(attempts).toHaveLength(0);

      const progress = await prisma.progressByTag.findMany({
        where: { userId: user.id },
      });

      expect(progress).toHaveLength(0);
    });
  });
});
