import { question_type , difficulty } from "../../generated/prisma/enums.js";

export type QuestionHistoryBody = {
  id: string;
  notes_id: string;
  review_id: string;
  expectedAnswer: string;
  question_type: question_type;
  question: string;
  difficulty: difficulty;
  generation_count: number;
  createdAt?: Date;
  updatedAt?: Date;
};
