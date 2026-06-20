import { Queue } from "bullmq";
import { bullRedis } from "../../configs/redis.js";

export const ragQueue = new Queue("ragQueue", {
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
