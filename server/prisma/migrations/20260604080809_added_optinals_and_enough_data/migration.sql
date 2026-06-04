-- AlterTable
ALTER TABLE "review" ADD COLUMN     "is_revision_enough" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "review_results" DROP NOT NULL,
ALTER COLUMN "review_results" DROP DEFAULT;
