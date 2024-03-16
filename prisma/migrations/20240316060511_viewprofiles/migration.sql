/*
  Warnings:

  - A unique constraint covering the columns `[user]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeen" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Queue_user_key" ON "Queue"("user");
