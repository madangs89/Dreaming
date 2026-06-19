import * as z from "zod";
import { RevisionAnswersSchema } from "./revisionAttemp.zod.js";

export type RevisionAnswerBody = z.infer<typeof RevisionAnswersSchema>;
