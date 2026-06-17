import { Queue } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import { QuestionJobData } from "./question.bull.type.js";

export const questionQueue = new Queue<QuestionJobData>("questionQueue", {
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
