-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "scheduledDate" DATETIME,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "duration" INTEGER,
    "followersStart" INTEGER,
    "followersEnd" INTEGER,
    "followersGained" INTEGER,
    "coinsStart" REAL,
    "coinsEnd" REAL,
    "coinsSpent" REAL,
    "peakViewers" INTEGER,
    "totalViews" INTEGER,
    "chatInteractions" INTEGER,
    "likes" INTEGER,
    "shares" INTEGER,
    "totalOrders" INTEGER,
    "totalRevenue" REAL,
    "conversionRate" REAL,
    "roi" REAL,
    "engagementRate" REAL,
    "excelUrl" TEXT,
    "aiExtractedData" TEXT,
    "notes" TEXT,
    "liveLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_lives" ("aiExtractedData", "chatInteractions", "coinsEnd", "coinsSpent", "coinsStart", "conversionRate", "createdAt", "duration", "engagementRate", "excelUrl", "finishedAt", "followersEnd", "followersGained", "followersStart", "id", "likes", "notes", "peakViewers", "roi", "shares", "startedAt", "status", "totalOrders", "totalRevenue", "totalViews", "updatedAt", "userId") SELECT "aiExtractedData", "chatInteractions", "coinsEnd", "coinsSpent", "coinsStart", "conversionRate", "createdAt", "duration", "engagementRate", "excelUrl", "finishedAt", "followersEnd", "followersGained", "followersStart", "id", "likes", "notes", "peakViewers", "roi", "shares", "startedAt", "status", "totalOrders", "totalRevenue", "totalViews", "updatedAt", "userId" FROM "lives";
DROP TABLE "lives";
ALTER TABLE "new_lives" RENAME TO "lives";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COLLABORATOR',
    "roleTitle" TEXT,
    "skipTutorial" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
