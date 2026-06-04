-- AlterTable
ALTER TABLE "review" ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "strong_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "weak_areas" TEXT[] DEFAULT ARRAY[]::TEXT[];
