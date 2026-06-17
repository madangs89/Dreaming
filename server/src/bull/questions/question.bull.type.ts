import * as z from "zod";
import { difficulty, question_type } from "../../generated/prisma/enums.js";
export const LLMQuestionSchema = z.object({
  question: z.string(),
  difficulty: z.nativeEnum(difficulty),
  expectedAnswer: z.string(),
  question_type: z.nativeEnum(question_type),
});

export type LLMQuestionData = z.infer<typeof LLMQuestionSchema>;

export type QuestionJobData = {
  review_id: string;
  generation_count: number;
  scheduled_date: Date;
};
