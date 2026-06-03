/*
  Warnings:

  - Made the column `url` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `memetype` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `public_id` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "url" SET NOT NULL,
ALTER COLUMN "memetype" SET NOT NULL,
ALTER COLUMN "public_id" SET NOT NULL;
