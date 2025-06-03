/*
  Warnings:

  - You are about to drop the column `accessTokenExpiresAt` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `authProvider` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `currentAccessToken` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "accessTokenExpiresAt",
DROP COLUMN "authProvider",
DROP COLUMN "currentAccessToken",
ADD COLUMN     "accessToken" TEXT;
