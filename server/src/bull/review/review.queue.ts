import { Queue } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import { ReviewJobData } from "./review.job.type.js";

export const reviewQueue = new Queue<ReviewJobData>("reviewQueue", {
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
});
