-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('chitChat', 'newFriend');

-- CreateEnum
CREATE TYPE "ReportAction" AS ENUM ('warn', 'ban', 'skip');

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "victim" INTEGER NOT NULL,
    "intruder" INTEGER NOT NULL,
    "type" "ReportType" NOT NULL,
    "message" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "action" "ReportAction",

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
