import { addDays } from "date-fns";
import { reviewRememberStatus } from "../generated/prisma/enums.js";

export const getNextReviewDate = (
  review_results: reviewRememberStatus,
): Date => {
  let currentDate = new Date();
  if (review_results === reviewRememberStatus.easy) {
    return addDays(currentDate, 7);
  } else if (review_results === reviewRememberStatus.forgot) {
    return addDays(currentDate, 1);
  } else if (review_results === reviewRememberStatus.partial) {
    return addDays(currentDate, 3);
  } else {
    return addDays(currentDate, 2);
  }
};

export const getQuestionDelayTime = (scheduled_date: Date): number => {
  const reviewTime = scheduled_date.getTime();

  const questionGenerationTime = reviewTime - 30 * 60 * 1000;

  const delay = questionGenerationTime - Date.now();
  return Math.max(0, delay);
};

export const returnTomorrowDate = (oldScheduled_date: Date): Date => {
  const tomorrow = new Date(oldScheduled_date);
  return addDays(tomorrow, 1);
};
