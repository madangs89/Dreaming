import { Worker, Job } from "bullmq";
import { bullRedis } from "../../configs/redis.js";

const ragWorker = new Worker("ragQueue", async (job: Job) => {}, {
  connection: bullRedis,
});
