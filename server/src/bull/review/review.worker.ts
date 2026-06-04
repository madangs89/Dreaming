import { Worker, Job } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import { ReviewJobData } from "./review.job.type.js";
import {
  getDocumentData,
  getReviewDetails,
  getReviewQuestionHistory,
  llmCreateQuestions,
} from "./review.helpers.js";
import { QuestionHistoryBody } from "../../modules/questionHistory/question.types.js";
import { ReviewBody } from "../../modules/review/review.types.js";
const reviewWorker = new Worker<ReviewJobData>(
  "reviewQueue",
  async (job: Job<ReviewJobData>) => {
    switch (job.name) {
      case "schedule_review":
        const { review_id, topic_id, user_id } = job.data;

        const reviewDetails = await getReviewDetails(review_id);

        const questionHistory = await getReviewQuestionHistory(review_id);

        const documentData = await getDocumentData(reviewDetails.notes_id);

        const llmRes = await llmCreateQuestions(
          reviewDetails,
          questionHistory,
          documentData,
        );
        // Handling ai call for question generation
        return {
          review_id,
          topic_id,
          user_id,
          reviewDetails,
        };
        break;

      default:
        break;
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
