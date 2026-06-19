-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "ReviewAttempt" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'processing',
    "score" INTEGER,
    "rememberStatus" "reviewRememberStatus",
    "strong_areas" TEXT[],
    "weak_areas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReviewAttempt" ADD CONSTRAINT "ReviewAttempt_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
