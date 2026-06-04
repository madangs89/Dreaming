import { difficulty, question_type } from "../../generated/prisma/enums.js";
import * as z from "zod";
export type ReviewJobData = {
  review_id: string;
  topic_id: string;
  user_id: string;
};

export const LLMQuestionSchema = z.object({
  question: z.string(),
  difficulty: z.nativeEnum(difficulty),
  expectedAnswer: z.string(),
  question_type: z.nativeEnum(question_type),
});

export type LLMQuestionData = z.infer<typeof LLMQuestionSchema>;
