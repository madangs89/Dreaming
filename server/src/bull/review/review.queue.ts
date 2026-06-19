import { Queue } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import { EvaluateJobData, ReviewJobData } from "./review.job.type.js";

export const reviewQueue = new Queue<ReviewJobData | EvaluateJobData>(
  "reviewQueue",
  {
    connection: bullRedis,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: {
        count: 1000,
      },

      removeOnFail: {
        count: 500,
      },
    },
  },
);
