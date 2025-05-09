-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "authProvider" TEXT,
ADD COLUMN     "currentAccessToken" TEXT;
