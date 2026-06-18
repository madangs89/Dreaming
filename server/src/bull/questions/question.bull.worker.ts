import { Worker, Job } from "bullmq";
import { QuestionJobData } from "./question.bull.type.js";
import { bullRedis } from "../../configs/redis.js";
import { getDocumentData, getReviewDetails } from "../review/review.helpers.js";
import {
  getReviewQuestionHistory,
  llmCheckContentWorthToGenerateQuiz,
  llmCreateQuestions,
} from "./question.bull.helper.js";
import { prisma } from "../../configs/prisma.js";

console.log("Question Worker Started");
const questionWorker = new Worker<QuestionJobData>(
  "questionQueue",
  async (job: Job<QuestionJobData>) => {
    const { generation_count, review_id, scheduled_date } = job.data;

    try {
      console.log({ generation_count, review_id, scheduled_date });

      const [reviewDetails, questionHistory] = await Promise.all([
        getReviewDetails(review_id),
        getReviewQuestionHistory(review_id),
      ]);

      if (!reviewDetails) {
        throw new Error("Review details not found");
      }

      if (reviewDetails.generation_count != generation_count) {
        throw new Error("Generation count mismatch");
      }

      if (!reviewDetails.notes.content) {
        console.log(
          "No notes content available, skipping question generation.",
        );
        return;
      }

      const documentData = await getDocumentData(reviewDetails.notes_id);

      const irWorthRes = await llmCheckContentWorthToGenerateQuiz(
        reviewDetails.notes.content,
        documentData,
      );

      if (!irWorthRes.isWorthGeneratingQuiz) {
        const deleteQuestions = await prisma.questionHistory.deleteMany({
          where: { review_id },
        });
        const deleteReview = await prisma.review.delete({
          where: { id: review_id },
        });
        console.log(
          "Content deemed insufficient for generating quiz, skipping question generation.",
        );
        return;
      }
      const llmRes = await llmCreateQuestions(
        reviewDetails,
        questionHistory,
        documentData,
      );

      const notes_id = reviewDetails.notes_id;

      const questionPayload = llmRes.map((q) => {
        return {
          review_id,
          notes_id,
          question: q.question,
          difficulty: q.difficulty,
          question_type: q.question_type,
          expectedAnswer: q.expectedAnswer,
          generation_count,
        };
      });

      const saveQuestions = await prisma.questionHistory.createMany({
        data: questionPayload,
      });
      return {
        review_id,
        reviewDetails,
        saveQuestions,
      };
    } catch (error) {
      console.error("Error processing job:", error);
      throw error;
    }
  },
  {
    connection: bullRedis,
  },
);

questionWorker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has completed. Result:`, job.returnvalue);
});

questionWorker.on("failed", (job, err) => {
  console.error(`Job with id has failed. Error:`, err);
});
