-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('email', 'google', 'github');

-- CreateEnum
CREATE TYPE "Memetype" AS ENUM ('image', 'video', 'audio', 'other', 'pdf', 'document', 'spreadsheet', 'presentation', 'text', 'archive', 'code', 'font', 'executable', 'model');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('scheduled', 'attempted', 'completed', 'missed');

-- CreateEnum
CREATE TYPE "reviewRememberStatus" AS ENUM ('easy', 'partial', 'forgot');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('coding', 'text');

-- CreateEnum
CREATE TYPE "difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "profile_url" TEXT,
    "provider" "Provider" NOT NULL DEFAULT 'email',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "public_id" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "public_id" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "topic_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "note_version" INTEGER NOT NULL DEFAULT 1,
    "index_version" INTEGER NOT NULL DEFAULT 1,
    "contentTimeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titleTimeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "notes_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "memetype" "Memetype" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_indexed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "notes_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'scheduled',
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "review_results" "reviewRememberStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_revision_enough" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "review_count" INTEGER NOT NULL DEFAULT 1,
    "strong_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weak_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "generation_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

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
    "difficulty" "difficulty" NOT NULL DEFAULT 'easy',
    "generation_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuestionHistory_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "review_notes_id_key" ON "review"("notes_id");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_notes_id_fkey" FOREIGN KEY ("notes_id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_notes_id_fkey" FOREIGN KEY ("notes_id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionHistory" ADD CONSTRAINT "QuestionHistory_notes_id_fkey" FOREIGN KEY ("notes_id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionHistory" ADD CONSTRAINT "QuestionHistory_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAttempt" ADD CONSTRAINT "ReviewAttempt_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
