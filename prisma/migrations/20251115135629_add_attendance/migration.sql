-- CreateTable
CREATE TABLE "daily_attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "checkinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stressLevel" TEXT NOT NULL,
    "mood" TEXT,
    "note" TEXT,
    CONSTRAINT "daily_attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "daily_attendance_userId_idx" ON "daily_attendance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_attendance_userId_checkinDate_key" ON "daily_attendance"("userId", "checkinDate");
