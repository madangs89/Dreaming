import { Worker, Job } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import { ReviewJobData } from "./review.job.type.js";
import {
  getDocumentData,
  getReviewDetails,
  getReviewQuestionHistory,
  llmCreateQuestions,
} from "./review.helpers.js";
import { prisma } from "../../configs/prisma.js";
const reviewWorker = new Worker<ReviewJobData>(
  "reviewQueue",
  async (job: Job<ReviewJobData>) => {
    try {
      switch (job.name) {
        case "schedule_review":
          const { review_id, topic_id, user_id } = job.data;

          // const reviewDetails = await getReviewDetails(review_id);

          // const questionHistory = await getReviewQuestionHistory(review_id);

          const [reviewDetails, questionHistory] = await Promise.all([
            getReviewDetails(review_id),
            getReviewQuestionHistory(review_id),
          ]);

          const documentData = await getDocumentData(reviewDetails.notes_id);

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
            };
          });

          const saveQuestions = await prisma.questionHistory.createMany({
            data: questionPayload,
          });

          console.log(saveQuestions);

          return {
            review_id,
            topic_id,
            user_id,
            reviewDetails,
            saveQuestions,
          };
          break;

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
