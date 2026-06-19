import { RevisionAnswerBody } from "../../modules/revisionAttempt/revisionattempt.types.js";
import { reviewQueue } from "./review.queue.js";

export const scheduleReviewJob = async (
  notes_id: string,
  topic_id: string,
  user_id: string,
  old_notes_content: string = "",
) => {
  await reviewQueue.add("schedule_review", {
    notes_id,
    topic_id,
    user_id,
    old_notes_content,
  });
};
export const scheduleEvaluateJob = async (
  review_id: string,
  user_id: string,
  attempt_id: string,
  answers: RevisionAnswerBody,
) => {
  await reviewQueue.add("evaluate_review", {
    review_id,
    user_id,
    attempt_id,
    answers,
  });
};
