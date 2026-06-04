-- CreateEnum
CREATE TYPE "difficulty" AS ENUM ('easy', 'medium', 'hard');

-- AlterTable
ALTER TABLE "QuestionHistory" ADD COLUMN     "difficulty" "difficulty" NOT NULL DEFAULT 'easy';
