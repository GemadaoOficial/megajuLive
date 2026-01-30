/*
  Warnings:

  - You are about to drop the column `screenshotUrl` on the `lives` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "live_screenshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "liveId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "live_screenshots_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "duration" INTEGER,
    "followersStart" INTEGER NOT NULL,
    "followersEnd" INTEGER,
    "followersGained" INTEGER,
    "coinsStart" REAL NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_lives" ("aiExtractedData", "chatInteractions", "coinsEnd", "coinsSpent", "coinsStart", "conversionRate", "createdAt", "duration", "excelUrl", "finishedAt", "followersEnd", "followersGained", "followersStart", "id", "likes", "notes", "peakViewers", "roi", "shares", "startedAt", "status", "totalOrders", "totalRevenue", "totalViews", "updatedAt", "userId") SELECT "aiExtractedData", "chatInteractions", "coinsEnd", "coinsSpent", "coinsStart", "conversionRate", "createdAt", "duration", "excelUrl", "finishedAt", "followersEnd", "followersGained", "followersStart", "id", "likes", "notes", "peakViewers", "roi", "shares", "startedAt", "status", "totalOrders", "totalRevenue", "totalViews", "updatedAt", "userId" FROM "lives";
DROP TABLE "lives";
ALTER TABLE "new_lives" RENAME TO "lives";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
