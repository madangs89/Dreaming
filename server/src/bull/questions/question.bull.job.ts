import { getQuestionDelayTime } from "../../configs/datesfn.js";
import { questionQueue } from "./question.bull.queue.js";
import { QuestionJobData } from "./question.bull.type.js";

export const scheduleQuestionJob = async ({
  review_id,
  generation_count,
  scheduled_date,
}: QuestionJobData) => {
  const date = new Date(scheduled_date);
  const delay = getQuestionDelayTime(date);
  await questionQueue.add(
    "generate_questions",
    {
      review_id,
      generation_count,
      scheduled_date,
    },
    {
      delay: 0,
    },
  );
};
