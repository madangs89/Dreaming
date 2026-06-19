import { Worker, Job } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import { EvaluateJobData, ReviewJobData } from "./review.job.type.js";

import { diffWords } from "diff";

import { prisma } from "../../configs/prisma.js";
import {
  getNextReviewDate,
  returnTomorrowDate,
} from "../../configs/datesfn.js";
import { reviewRememberStatus } from "../../generated/prisma/enums.js";
import { scheduleQuestionJob } from "../questions/question.bull.job.js";
import { llmAnswerEvaluation } from "./review.helpers.js";

type BlockNoteContent = {
  type: string;
  text?: string;
};

type BlockNoteBlock = {
  id: string;
  type: string;
  content?: BlockNoteContent[];
  children?: BlockNoteBlock[];
};

function getTextContent(blocks: BlockNoteBlock[]): string {
  let text = "";

  for (const block of blocks) {
    text += block.content?.map((item) => item.text || "").join("") || "";

    text += "\n";

    if (block.children?.length) {
      text += getTextContent(block.children);
    }
  }

  return text;
}

function isNoteEmpty(blocks: BlockNoteBlock[]) {
  const text = getTextContent(blocks);

  return text.trim().length === 0;
}

console.log("Review Worker Started");
const reviewWorker = new Worker<ReviewJobData | EvaluateJobData>(
  "reviewQueue",
  async (job: Job<ReviewJobData | EvaluateJobData>) => {
    try {
      switch (job.name) {
        case "schedule_review": {
          const data = job.data as ReviewJobData;

          const { notes_id, topic_id, user_id, old_notes_content } = data;

          const notesData = await prisma.note.findUnique({
            where: {
              id: notes_id,
            },
          });

          if (!notesData) {
            throw new Error(`Note with id ${notes_id} not found`);
          }

          const reviewData = await prisma.review.findUnique({
            where: {
              notes_id: notes_id,
            },
          });

          const newBlocks = JSON.parse(
            notesData.content ?? "[]",
          ) as BlockNoteBlock[];

          // If not review exists hence we are creating new
          if (!reviewData && !isNoteEmpty(newBlocks)) {
            // 1 Creating Review
            const newReview = await prisma.review.create({
              data: {
                notes_id: notes_id,
                topic_id: topic_id,
                user_id: user_id,
                scheduled_date: getNextReviewDate(reviewRememberStatus.forgot),
              },
            });

            console.log("New review created:", newReview);
            // 2 Pushing To questionGenerationQueue
            await scheduleQuestionJob({
              review_id: newReview.id,
              generation_count: newReview.generation_count,
              scheduled_date: newReview.scheduled_date,
            });

            // 3 Sending Notification To User

            return newReview;
          }

          // Need to handle if new Content become empty then we need to delete the review and questions
          if (reviewData && isNoteEmpty(newBlocks)) {
            console.log("New notes content is empty, deleting review.");
            // 1 Deleting Review

            const deleteQuestions = await prisma.questionHistory.deleteMany({
              where: { review_id: reviewData.id },
            });
            console.log("Deleted questions:", deleteQuestions);
            const deletedReview = await prisma.review.delete({
              where: {
                notes_id: notes_id,
              },
            });

            console.log("Deleted review:", deletedReview);
            return deletedReview;
          }

          if (!reviewData) {
            console.log(
              "No existing review and new content is empty or too short, skipping review creation.",
            );
            return null;
          }

          // If review Exists and need to check difference
          if (
            !old_notes_content ||
            isNoteEmpty(JSON.parse(old_notes_content) as BlockNoteBlock[])
          ) {
            console.log(
              "Old notes content is empty or too short, skipping diff check.",
            );
            return reviewData;
          }

          const oldBlocks = JSON.parse(old_notes_content) as BlockNoteBlock[];

          const newText = getTextContent(newBlocks);
          const oldText = getTextContent(oldBlocks);
          const diff = diffWords(oldText, newText);
          const totalWords = diff.reduce(
            (acc, part) => acc + (part.count || 0),
            0,
          );

          const changedWords = diff
            .filter((p) => p.added || p.removed)
            .reduce((acc, part) => acc + (part.count || 0), 0);

          const percentage =
            totalWords === 0 ? 0 : (changedWords / totalWords) * 100;

          console.log(
            `Total Words: ${totalWords}, Changed Words: ${changedWords}, Percentage Change: ${percentage.toFixed(2)}%`,
          );

          if (reviewData && reviewData.review_count == 1) {
            if (percentage > 30) {
              const updatedReview = await prisma.review.update({
                where: {
                  notes_id: notes_id,
                },
                data: {
                  scheduled_date: getNextReviewDate(
                    reviewRememberStatus.forgot,
                  ),
                  generation_count: {
                    increment: 1,
                  },
                },
              });

              console.log(
                "Review updated due to significant content change:",
                updatedReview,
              );
              // 2 Pushing To questionGenerationQueue
              await scheduleQuestionJob({
                review_id: updatedReview.id,
                generation_count: updatedReview.generation_count,
                scheduled_date: updatedReview.scheduled_date,
              });
              return updatedReview;
            } else if (percentage > 10) {
              // 1 Updating Review
              const updatedReview = await prisma.review.update({
                where: {
                  notes_id: notes_id,
                },
                data: {
                  scheduled_date: returnTomorrowDate(reviewData.scheduled_date),
                  generation_count: {
                    increment: 1,
                  },
                },
              });

              console.log(
                "Review updated due to significant content change:",
                updatedReview,
              );
              // 2 Pushing To questionGenerationQueue
              await scheduleQuestionJob({
                review_id: updatedReview.id,
                generation_count: updatedReview.generation_count,
                scheduled_date: updatedReview.scheduled_date,
              });
              return updatedReview;
            }
          } else if (reviewData && reviewData.review_count > 1) {
            const reviewScheduledDate = new Date(reviewData.scheduled_date);
            const currentDate = new Date();

            const diffInDays = Math.ceil(
              (reviewScheduledDate.getTime() - currentDate.getTime()) /
                (1000 * 60 * 60),
            );
            if (percentage > 30) {
              const updatedReview = await prisma.review.update({
                where: {
                  notes_id: notes_id,
                },
                data: {
                  scheduled_date: getNextReviewDate(
                    reviewRememberStatus.forgot,
                  ),
                  generation_count: {
                    increment: 1,
                  },
                },
              });

              // 2 Pushing To questionGenerationQueue
              await scheduleQuestionJob({
                review_id: updatedReview.id,
                generation_count: updatedReview.generation_count,
                scheduled_date: updatedReview.scheduled_date,
              });
              return updatedReview;
            } else if (percentage > 10) {
              if (diffInDays <= 48) {
                const updatedReview = await prisma.review.update({
                  where: {
                    notes_id: notes_id,
                  },
                  data: {
                    scheduled_date: returnTomorrowDate(
                      reviewData.scheduled_date,
                    ),
                    generation_count: {
                      increment: 1,
                    },
                  },
                });

                console.log(
                  "Review updated due to significant content change:",
                  updatedReview,
                );
                // 2 Pushing To questionGenerationQueue
                await scheduleQuestionJob({
                  review_id: updatedReview.id,
                  generation_count: updatedReview.generation_count,
                  scheduled_date: updatedReview.scheduled_date,
                });
                return updatedReview;
              } else {
                return reviewData;
              }
            }
          }

          break;
        }

        case "evaluate_review": {
          const { attempt_id, answers, review_id, user_id } =
            job.data as EvaluateJobData;

          if (!attempt_id || !answers || !review_id || !user_id) {
            throw new Error("Missing required data for evaluate_review job");
          }

          const review = await prisma.review.findUnique({
            where: { id: review_id },
          });

          if (!review) {
            throw new Error(`Review with id ${review_id} not found`);
          }

          const allQuestionIds = Object.keys(answers);

          const revisionCount = review.review_count;
          const old_strong_areas = review.strong_areas || [];
          const old_weak_areas = review.weak_areas || [];

          const allQuestions = await prisma.questionHistory.findMany({
            where: {
              review_id: review_id,
              id: { in: allQuestionIds },
            },
          });

          const answerPayload = allQuestions.map((question) => {
            return {
              question: question.question,
              answer: answers[question.id],
            };
          });

          const prompt = `
          Review Count: ${revisionCount}
          Strong Areas: ${old_strong_areas}
          Weak Areas: ${old_weak_areas}

          Today Assessment: ${JSON.stringify(answerPayload)}
          `;

          const evaluationResult = await llmAnswerEvaluation(
            attempt_id,
            prompt,
          );

          console.log("Evaluation Result:", evaluationResult);

          return true;

          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error("Error processing job:", error);
      throw error;
    }
  },
  {
    connection: bullRedis,
  },
);

reviewWorker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has completed. Result:`, job.returnvalue);
});

reviewWorker.on("failed", (job, err) => {
  console.error(`Job with id has failed. Error:`, err);
});
