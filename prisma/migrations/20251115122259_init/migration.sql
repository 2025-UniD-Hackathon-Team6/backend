-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "last_login" DATETIME,
    "create_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JwtToken" (
    "user_id" INTEGER NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    CONSTRAINT "JwtToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_interested_position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_interested_position_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_interested_position_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "job_position" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_interested_category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_interested_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_interested_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "job_category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "job_category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "job_position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "job_position_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "job_category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "job_posting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT,
    "deadline" DATETIME,
    "sourceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "job_posting_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "job_category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "job_posting_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "job_position" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "job_archives" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "postingId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Middle',
    "userNote" TEXT,
    "archivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "job_archives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "job_archives_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "job_posting" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JwtToken_user_id_key" ON "JwtToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_interested_position_user_id_key" ON "user_interested_position"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_interested_category_user_id_key" ON "user_interested_category"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_category_name_key" ON "job_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_position_categoryId_name_key" ON "job_position"("categoryId", "name");

-- CreateIndex
CREATE INDEX "job_posting_categoryId_positionId_idx" ON "job_posting"("categoryId", "positionId");

-- CreateIndex
CREATE INDEX "job_posting_deadline_idx" ON "job_posting"("deadline");

-- CreateIndex
CREATE INDEX "job_archives_userId_idx" ON "job_archives"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "job_archives_userId_postingId_key" ON "job_archives"("userId", "postingId");
