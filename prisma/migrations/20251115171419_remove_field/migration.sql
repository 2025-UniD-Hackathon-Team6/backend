/*
  Warnings:

  - You are about to drop the column `mood` on the `daily_attendance` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `daily_attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN "interests" TEXT;

-- CreateTable
CREATE TABLE "daily_keyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "position_id" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "create_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_keyword_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_keyword_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "job_position" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "position_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "create_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_report_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "job_position" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_daily_attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "checkinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stressLevel" TEXT NOT NULL,
    CONSTRAINT "daily_attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_daily_attendance" ("checkinDate", "id", "stressLevel", "userId") SELECT "checkinDate", "id", "stressLevel", "userId" FROM "daily_attendance";
DROP TABLE "daily_attendance";
ALTER TABLE "new_daily_attendance" RENAME TO "daily_attendance";
CREATE INDEX "daily_attendance_userId_idx" ON "daily_attendance"("userId");
CREATE UNIQUE INDEX "daily_attendance_userId_checkinDate_key" ON "daily_attendance"("userId", "checkinDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "daily_keyword_position_id_idx" ON "daily_keyword"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_keyword_date_user_id_key" ON "daily_keyword"("date", "user_id");

-- CreateIndex
CREATE INDEX "daily_report_position_id_idx" ON "daily_report"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_report_date_user_id_key" ON "daily_report"("date", "user_id");
