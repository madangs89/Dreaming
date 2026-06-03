import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  NoteCreateBody,
  NoteErrorResponse,
  NoteSuccessResponse,
} from "./notes.types.js";
import { createNoteSchema } from "./notes.zod.js";
import { prismaErrorHandler } from "../../configs/prisma.js";

export const createNote = async (
  req: Request<{}, {}, NoteCreateBody>,
  res: Response<NoteErrorResponse | NoteSuccessResponse>,
) => {
  try {
    const results = createNoteSchema.safeParse(req.body);

    if (!results.success) {
      return res.status(400).json({
        message: "Invalid request body",
        success: false,
        errors: results.error.format(),
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }

    return res.status(500).json({
      message: "An unexpected error occurred",
      success: false,
    });
  }
};
