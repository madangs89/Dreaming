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
