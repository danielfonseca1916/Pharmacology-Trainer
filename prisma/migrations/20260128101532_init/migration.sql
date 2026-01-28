-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" REAL NOT NULL,
    "feedback" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Attempt" ("answers", "createdAt", "entityId", "entityType", "feedback", "id", "score", "userId") SELECT "answers", "createdAt", "entityId", "entityType", "feedback", "id", "score", "userId" FROM "Attempt";
DROP TABLE "Attempt";
ALTER TABLE "new_Attempt" RENAME TO "Attempt";
CREATE INDEX "Attempt_userId_createdAt_idx" ON "Attempt"("userId", "createdAt");
CREATE INDEX "Attempt_userId_entityType_entityId_idx" ON "Attempt"("userId", "entityType", "entityId");
CREATE TABLE "new_Bookmark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bookmark" ("createdAt", "entityId", "entityType", "id", "userId") SELECT "createdAt", "entityId", "entityType", "id", "userId" FROM "Bookmark";
DROP TABLE "Bookmark";
ALTER TABLE "new_Bookmark" RENAME TO "Bookmark";
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");
CREATE INDEX "Bookmark_entityType_entityId_idx" ON "Bookmark"("entityType", "entityId");
CREATE TABLE "new_DatasetOverride" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "jsonText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DatasetOverride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DatasetOverride" ("createdAt", "createdById", "description", "id", "isActive", "jsonText", "name", "updatedAt") SELECT "createdAt", "createdById", "description", "id", "isActive", "jsonText", "name", "updatedAt" FROM "DatasetOverride";
DROP TABLE "DatasetOverride";
ALTER TABLE "new_DatasetOverride" RENAME TO "DatasetOverride";
CREATE UNIQUE INDEX "DatasetOverride_name_key" ON "DatasetOverride"("name");
CREATE INDEX "DatasetOverride_isActive_idx" ON "DatasetOverride"("isActive");
CREATE INDEX "DatasetOverride_createdById_idx" ON "DatasetOverride"("createdById");
CREATE TABLE "new_ProgressByTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "courseBlock" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressByTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProgressByTag" ("correctCount", "courseBlock", "id", "lastAttemptAt", "module", "tag", "userId", "wrongCount") SELECT "correctCount", "courseBlock", "id", "lastAttemptAt", "module", "tag", "userId", "wrongCount" FROM "ProgressByTag";
DROP TABLE "ProgressByTag";
ALTER TABLE "new_ProgressByTag" RENAME TO "ProgressByTag";
CREATE INDEX "ProgressByTag_userId_module_courseBlock_tag_idx" ON "ProgressByTag"("userId", "module", "courseBlock", "tag");
CREATE UNIQUE INDEX "ProgressByTag_userId_module_courseBlock_tag_key" ON "ProgressByTag"("userId", "module", "courseBlock", "tag");
CREATE TABLE "new_SpacedRepetitionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "easeFactor" REAL NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "nextReviewAt" DATETIME NOT NULL,
    "lastReviewedAt" DATETIME NOT NULL,
    CONSTRAINT "SpacedRepetitionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpacedRepetitionItem" ("easeFactor", "entityId", "entityType", "id", "intervalDays", "lastReviewedAt", "nextReviewAt", "userId") SELECT "easeFactor", "entityId", "entityType", "id", "intervalDays", "lastReviewedAt", "nextReviewAt", "userId" FROM "SpacedRepetitionItem";
DROP TABLE "SpacedRepetitionItem";
ALTER TABLE "new_SpacedRepetitionItem" RENAME TO "SpacedRepetitionItem";
CREATE INDEX "SpacedRepetitionItem_userId_nextReviewAt_idx" ON "SpacedRepetitionItem"("userId", "nextReviewAt");
CREATE UNIQUE INDEX "SpacedRepetitionItem_userId_entityType_entityId_key" ON "SpacedRepetitionItem"("userId", "entityType", "entityId");
CREATE TABLE "new_UserSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserSettings" ("createdAt", "id", "language", "updatedAt", "userId") SELECT "createdAt", "id", "language", "updatedAt", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
