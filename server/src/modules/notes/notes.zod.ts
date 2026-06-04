import * as z from "zod";
import {
  Memetype,
  ReviewStatus,
  reviewRememberStatus,
} from "../../generated/prisma/client.js";

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  content: z.string().optional(),
  topic_id: z.string().uuid("Invalid topic ID"),
});

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  notes_id: z.string().uuid(),
  url: z.string().url(),
  memetype: z.nativeEnum(Memetype),
  title: z.string(),
  public_id: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  notes_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  scheduled_date: z.date(),
  status: z.nativeEnum(ReviewStatus).default(ReviewStatus.scheduled),
  is_completed: z.boolean().default(false),
  review_results: z
    .nativeEnum(reviewRememberStatus)
    .default(reviewRememberStatus.easy),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string().nullable().optional(),
  topic_id: z.string().uuid(),
  documents: DocumentSchema.array().optional(),
  reviews: ReviewSchema.array().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const NoteParamSchema = z.object({
  topic_id: z.string().uuid(),
});

export const NoteUpdateSchema = z.object({
  title: z
    .string()
    .max(255, "Title must be less than 255 characters")
    .optional(),
  content: z.string().optional(),
});
