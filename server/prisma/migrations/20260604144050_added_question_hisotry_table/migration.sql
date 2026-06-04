-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('coding', 'text');

-- CreateTable
CREATE TABLE "QuestionHistory" (
    "id" TEXT NOT NULL,
    "notes_id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "expectedAnswer" TEXT NOT NULL,
    "question_type" "question_type" NOT NULL DEFAULT 'text',
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionHistory" ADD CONSTRAINT "QuestionHistory_notes_id_fkey" FOREIGN KEY ("notes_id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionHistory" ADD CONSTRAINT "QuestionHistory_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
