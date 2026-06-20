import * as z from "zod";
import { Memetype } from "../../generated/prisma/enums.js";
import { DocumentParamSchema } from "./documents.zod.js";

export type DocumentSuccessResponse<T> = {
  message: string;
  success: true;
  document?: T;
};
export type DocumentErrorResponse = {
  message: string;
  success: false;
  errors?: unknown;
};

export type DocumentBody = {
  id: string;
  notes_id: string;
  url: string;
  memetype: Memetype;
  title: string;
  public_id: string;
  createdAt?: Date;
  updatedAt?: Date;
  is_indexed?: boolean;
};

export type DocumentParams = z.infer<typeof DocumentParamSchema>;
