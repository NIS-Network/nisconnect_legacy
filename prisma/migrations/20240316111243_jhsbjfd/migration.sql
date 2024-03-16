/*
  Warnings:

  - You are about to drop the column `disabled` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `liked` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "disabled",
DROP COLUMN "liked";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastSeen",
ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "liked" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "seen" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
