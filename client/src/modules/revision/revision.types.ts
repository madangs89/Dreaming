import type { NoteData } from "../notes/notes.type";
import type { TopicData } from "../topic/topic.types";

export type RevisionQuestion = {
  id: string;
  question: string;
  generation_count: number;
  notes_id: string;
  review_id: string;
  expectedAnswer: string;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RevisionBody = {
  id: string;
  user_id: string;
  notes_id: string;
  topic_id: string;
  scheduled_date: Date;
  status: string;
  is_completed: boolean;
  generation_count: number;
  is_revision_enough: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  review_count?: number;
  notes: Omit<NoteData, "documents" | "reviews">;
  topic: Omit<TopicData, "_count">;
};

export type RevisionSuccessRes<T> = {
  message: string;
  success: boolean;
  review?: T;
};
export type QuestionSuccessRes<T> = {
  message: string;
  success: boolean;
  questions?: T;
};

export type RevisionAttemptBody = {
  id: string;
  review_id: string;
  status: StringConstructor;
  score?: number;
  rememberStatus?: string;
  strong_areas: string[];
  weak_areas: string[];
  createdAt: Date;
};

export type RevisionAttemptSuccessRes<T> = {
  message: string;
  success: boolean;
  attempt?: T;
};
