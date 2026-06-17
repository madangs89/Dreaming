import { Worker, Job } from "bullmq";
import { QuestionJobData } from "./question.bull.type.js";
import { bullRedis } from "../../configs/redis.js";

//  const { review_id, topic_id, user_id } = job.data;
//           const [reviewDetails, questionHistory] = await Promise.all([
//             getReviewDetails(review_id),
//             getReviewQuestionHistory(review_id),
//           ]);
//           const documentData = await getDocumentData(reviewDetails.notes_id);

//           const llmRes = await llmCreateQuestions(
//             reviewDetails,
//             questionHistory,
//             documentData,
//           );

//           const notes_id = reviewDetails.notes_id;

//           const questionPayload = llmRes.map((q) => {
//             return {
//               review_id,
//               notes_id,
//               question: q.question,
//               difficulty: q.difficulty,
//               question_type: q.question_type,
//               expectedAnswer: q.expectedAnswer,
//             };
//           });

//           const saveQuestions = await prisma.questionHistory.createMany({
//             data: questionPayload,
//           });
//           return {
//             review_id,
//             topic_id,
//             user_id,
//             reviewDetails,
//             saveQuestions,
//   };



console.log("Question Worker Started");
const questionWorker = new Worker<QuestionJobData>(
  "questionQueue",
  async (job: Job<QuestionJobData>) => {
    const { generation_count, review_id, scheduled_date } = job.data;
    console.log({generation_count, review_id, scheduled_date});

    return true;
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
