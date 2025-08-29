/*
  Warnings:

  - Added the required column `updatedAt` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "checkOut" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT;

-- Add updatedAt with default value for existing rows
ALTER TABLE "public"."Attendance" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove default after adding
ALTER TABLE "public"."Attendance" ALTER COLUMN "updatedAt" DROP DEFAULT;
