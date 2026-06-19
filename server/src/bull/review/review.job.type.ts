import * as z from "zod";
import { RevisionAnswerBody } from "../../modules/revisionAttempt/revisionattempt.types.js";
export type ReviewJobData = {
  notes_id: string;
  topic_id: string;
  user_id: string;
  old_notes_content?: string;
};
export type EvaluateJobData = {
  review_id: string;
  user_id: string;
  attempt_id: string;
  answers: RevisionAnswerBody;
};

export const LLmEvaluationSchema = z.object({
  score: z.number(),
  rememberStatus: z.string(),
  strong_areas: z.array(z.string()),
  weak_areas: z.array(z.string()),
});

export type LLmEvaluationData = z.infer<typeof LLmEvaluationSchema>;
