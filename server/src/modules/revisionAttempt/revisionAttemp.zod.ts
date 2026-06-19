import * as z from "zod";
export const RevisionAnswersSchema = z.record(
  z.string().min(1),
  z.string().min(1),
);
