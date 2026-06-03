import * as z from "zod";
import { createNoteSchema } from "./notes.zod.js";

export type NoteSuccessResponse<Data = unknown> = {
  message: string;
  success: true;
  note?: Data;
};

export type NoteErrorResponse = {
  message: string;
  success: false;
  errors?: unknown;
};

export type NoteCreateBody = z.infer<typeof createNoteSchema>;
