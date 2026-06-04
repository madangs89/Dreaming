import { Request, Response } from "express";
import { Memetype, Prisma } from "../../generated/prisma/client.js";
import {
  NoteBody,
  NoteCreateBody,
  NoteErrorResponse,
  NoteParams,
  NoteSuccessResponse,
  NoteUpdateBody,
} from "./notes.types.js";
import {
  createNoteSchema,
  NoteParamSchema,
  NoteUpdateSchema,
} from "./notes.zod.js";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import {
  handleSingleDelete,
  handleSingleUpload,
} from "../../configs/cloudinary.js";
import { v4 as uuidv4 } from "uuid";
export function getMemetype(mimetype: string): Memetype {
  if (mimetype.startsWith("image/")) {
    return Memetype.image;
  }

  if (mimetype.startsWith("video/")) {
    return Memetype.video;
  }

  if (mimetype.startsWith("audio/")) {
    return Memetype.audio;
  }

  return Memetype.other;
}

export const createNote = async (
  req: Request<{}, {}, NoteCreateBody>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<NoteBody>>,
) => {
  const fileData: Prisma.DocumentUncheckedCreateInput[] = [];

  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const results = createNoteSchema.safeParse(req.body);
    if (!results.success) {
      return res.status(400).json({
        message: "Invalid request body",
        success: false,
        errors: results.error.format(),
      });
    }

    const { title, content, topic_id } = results.data;

    const files = req.files as Express.Multer.File[] | undefined;

    let note_id = uuidv4();

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await handleSingleUpload(file.path);
        if (!uploadResult.success || !uploadResult.url) {
          for (const uploadedFiles of fileData) {
            const deleteResult = await handleSingleDelete(
              uploadedFiles.public_id,
            );
          }
          return res.status(500).json({
            message: "Failed to upload file",
            success: false,
          });
        }

        let payload: Prisma.DocumentCreateManyInput = {
          memetype: getMemetype(file.mimetype),
          title: file.originalname,
          url: uploadResult.url.secure_url,
          public_id: uploadResult.url.public_id,
          notes_id: note_id,
        };
        fileData.push(payload);
      }
    }

    const noteData = await prisma.$transaction(async (tx) => {
      return await tx.note.create({
        data: {
          id: note_id,
          title,
          content,
          topic_id,
          documents: {
            createMany: { data: fileData.map(({ notes_id, ...rest }) => rest) },
          },
        },
        include: { documents: true, reviews: true },
      });
    });

    return res.status(201).json({
      message: "Note created successfully",
      success: true,
      note: noteData,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }

    for (const uploadedFiles of fileData) {
      await handleSingleDelete(uploadedFiles.public_id);
    }

    return res.status(500).json({
      message: "An unexpected error occurred",
      success: false,
    });
  }
};

export const getAllNotes = async (
  req: Request<NoteParams>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<NoteBody[]>>,
) => {
  try {
    const results = await NoteParamSchema.safeParseAsync(req.params);
    if (!results.success) {
      return res.status(400).json({
        message: "Invalid request parameters",
        success: false,
        errors: results.error.format(),
      });
    }

    const { topic_id } = results.data;

    const notes = await prisma.note.findMany({
      where: { topic_id },
      include: { documents: true, reviews: true },
    });

    return res.status(200).json({
      message: "Notes retrieved successfully",
      success: true,
      note: notes,
    });
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

export const getSingleNote = async (
  req: Request<{ id: string }>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<NoteBody>>,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Note ID is required",
        success: false,
      });
    }
    const note = await prisma.note.findUnique({
      where: { id },
      include: { documents: true, reviews: true },
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Note retrieved successfully",
      success: true,
      note,
    });
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

export const updateNote = async (
  req: Request<{ id: string }, {}, NoteUpdateBody>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<NoteBody>>,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Note ID is required",
        success: false,
      });
    }

    const results = NoteUpdateSchema.safeParse(req.body);
    if (!results.success) {
      return res.status(400).json({
        message: "Invalid request body",
        success: false,
        errors: results.error.format(),
      });
    }

    const { title, content } = results.data;

    if (!title && !content) {
      return res.status(400).json({
        message:
          "At least one field (title or content) must be provided for update",
        success: false,
      });
    }

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
        success: false,
      });
    }

    const payload: Prisma.NoteUpdateInput = {
      title: title ? title : note.title,
      content: content ? content : note.content,
    };

    const updatedNote = await prisma.note.update({
      where: { id },
      data: payload,
      include: { documents: true, reviews: true },
    });
    return res.status(200).json({
      message: "Note updated successfully",
      success: true,
      note: updatedNote,
    });
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
