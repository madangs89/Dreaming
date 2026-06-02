import * as z from "zod";
import { TopicCreateSchema } from "./topic.zod.js";

export type Topic = z.infer<typeof TopicCreateSchema>;
