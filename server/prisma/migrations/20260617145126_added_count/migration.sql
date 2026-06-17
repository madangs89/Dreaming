-- AlterTable
ALTER TABLE "QuestionHistory" ADD COLUMN     "generation_count" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "review" ADD COLUMN     "generation_count" INTEGER NOT NULL DEFAULT 1;
