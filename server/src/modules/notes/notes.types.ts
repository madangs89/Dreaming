import * as z from "zod";
import {
  createNoteSchema,
  DocumentSchema,
  NoteParamSchema,
  NoteSchema,
  NoteUpdateSchema,
  ReviewSchema,
} from "./notes.zod.js";

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

export type NoteBody = z.infer<typeof NoteSchema>;
export type DocumentBody = z.infer<typeof DocumentSchema>;
export type ReviewBody = z.infer<typeof ReviewSchema>;

export type NoteParams = z.infer<typeof NoteParamSchema>;
export type NoteUpdateBody = z.infer<typeof NoteUpdateSchema>;
