import * as z from "zod";
import { TopicCreateSchema } from "./topic.zod.js";

export type Topic = z.infer<typeof TopicCreateSchema>;

export type TopicData = {
  id: string;
  title: string;
  source_url?: string | null;
  user_id: string;
  updatedAt: Date;
  createdAt: Date;
  _count?: {
    notes: number;
  };
};

export type TopicResponse<Data = unknown> = {
  message: string;
  success: boolean;
  errors?: unknown;
  topic?: Data;
};

export type TopicParams = {
  id: string;
};

export type TopicEdit = {
  title?: string;
};
