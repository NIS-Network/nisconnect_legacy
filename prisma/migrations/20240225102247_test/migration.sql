-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "PartnerGender" AS ENUM ('male', 'female', 'all');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('akt', 'akb', 'fmalm', 'hbalm', 'ast', 'atr', 'krg', 'kt', 'kst', 'kzl', 'pvl', 'ptr', 'sm', 'tk', 'trz', 'ura', 'ukk', 'fmsh', 'hbsh', 'trk');

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "partner" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "partnerGender" "PartnerGender" NOT NULL,
    "photoId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
