import { reviewQueue } from "./review.queue.js";

export const scheduleReviewJob = async (
  review_id: string,
  topic_id: string,
  user_id: string,
) => {
  await reviewQueue.add("schedule_review", {
    review_id,
    topic_id,
    user_id,
  });
};
