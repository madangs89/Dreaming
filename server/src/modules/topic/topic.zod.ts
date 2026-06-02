import * as z from "zod";

export const TopicCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
});
