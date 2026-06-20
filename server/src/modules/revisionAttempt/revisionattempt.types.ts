import * as z from "zod";
import { RevisionAnswersSchema } from "./revisionAttemp.zod.js";
import {
  AttemptStatus,
  reviewRememberStatus,
} from "../../generated/prisma/enums.js";

export type RevisionAnswerBody = z.infer<typeof RevisionAnswersSchema>;

export type RevisionAttemptBody = {
  id: string;
  review_id: string;
  status: AttemptStatus;
  score: number | null;
  rememberStatus?: reviewRememberStatus | null;
  strong_areas: string[];
  weak_areas: string[];
  createdAt: Date;
};

export type RevisionAttemptSuccessResponse<T> = {
  attempt: T;
  success: true;
  message: string;
};

export type RevisionAttemptErrorResponse = {
  message: string;
  success: false;
  errors?: unknown;
};
