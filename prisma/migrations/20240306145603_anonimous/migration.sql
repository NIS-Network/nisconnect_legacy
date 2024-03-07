/*
  Warnings:

  - A unique constraint covering the columns `[login]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('searching', 'default', 'chatting');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'default',
ALTER COLUMN "partner" SET DATA TYPE BIGINT,
ALTER COLUMN "role" SET NOT NULL;

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "user" BIGINT NOT NULL,
    "gender" "Gender" NOT NULL,
    "genderPreference" "GenderPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
