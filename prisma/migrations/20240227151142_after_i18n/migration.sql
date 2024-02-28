/*
  Warnings:

  - You are about to drop the column `partnerGender` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `genderPreference` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('male', 'female', 'all');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'superadmin');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "partnerGender",
ADD COLUMN     "genderPreference" "GenderPreference" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "language" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" DEFAULT 'user',
ALTER COLUMN "partner" DROP NOT NULL;

-- DropEnum
DROP TYPE "PartnerGender";
