/*
  Warnings:

  - A unique constraint covering the columns `[notes_id]` on the table `review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "review_notes_id_key" ON "review"("notes_id");
