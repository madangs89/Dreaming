import * as z from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  content: z.string().optional(),
  topic_id: z.string().uuid("Invalid topic ID"),
});
