import {
  reviewRememberStatus,
  ReviewStatus,
} from "../../generated/prisma/enums.js";
import { NoteBody } from "../notes/notes.types.js";
import { TopicData } from "../topic/topic.types.js";

export type ReviewBody = {
  id: string;
  user_id: string;
  notes_id: string;
  topic_id: string;
  scheduled_date: Date;
  status: ReviewStatus;
  is_completed: boolean;
  review_results: reviewRememberStatus | null;
  is_revision_enough: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  topic: TopicData;
  notes: Omit<NoteBody, "documents" | "reviews">;
  weak_areas?: string[] | [];
  strong_areas?: string[] | [];
  review_count?: number;
};

export type ReviewSuccessResponse<T> = {
  review: T;
  success: true;
  message: string;
};

export type ReviewErrorResponse = {
  message: string;
  success: false;
  errors?: unknown;
};
