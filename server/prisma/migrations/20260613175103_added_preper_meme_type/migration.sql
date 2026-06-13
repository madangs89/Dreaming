-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Memetype" ADD VALUE 'pdf';
ALTER TYPE "Memetype" ADD VALUE 'document';
ALTER TYPE "Memetype" ADD VALUE 'spreadsheet';
ALTER TYPE "Memetype" ADD VALUE 'presentation';
ALTER TYPE "Memetype" ADD VALUE 'text';
ALTER TYPE "Memetype" ADD VALUE 'archive';
ALTER TYPE "Memetype" ADD VALUE 'code';
ALTER TYPE "Memetype" ADD VALUE 'font';
ALTER TYPE "Memetype" ADD VALUE 'executable';
ALTER TYPE "Memetype" ADD VALUE 'model';
