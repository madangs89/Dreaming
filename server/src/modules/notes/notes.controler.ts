import { Request, Response } from "express";
import {
  Memetype,
  Prisma,
  reviewRememberStatus,
  ReviewStatus,
} from "../../generated/prisma/client.js";
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
import { getNextReviewDate } from "../../configs/datesfn.js";
import { reviewQueue } from "../../bull/review/review.queue.js";
import { scheduleReviewJob } from "../../bull/review/review.jobs.js";
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

  if (mimetype === "application/pdf") {
    return Memetype.pdf;
  }

  if (
    mimetype.includes("word") ||
    mimetype === "application/msword" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return Memetype.document;
  }

  if (
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel") ||
    mimetype === "text/csv"
  ) {
    return Memetype.spreadsheet;
  }

  if (mimetype.includes("presentation") || mimetype.includes("powerpoint")) {
    return Memetype.presentation;
  }

  if (mimetype.startsWith("text/") || mimetype === "application/json") {
    return Memetype.text;
  }

  if (
    mimetype.includes("zip") ||
    mimetype.includes("rar") ||
    mimetype.includes("7z") ||
    mimetype.includes("tar")
  ) {
    return Memetype.archive;
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
      let n = await tx.note.create({
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

      if (n.content && n.content.length > 2) {
        scheduleReviewJob(n.id, topic_id, user_id, n.content);
      }
      return n;
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

export const createNoteOnlyTitle = async (
  req: Request<{}, {}, { title: string; topic_id: string; timeStamp?: Date }>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<NoteBody>>,
) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const { title, topic_id, timeStamp = new Date() } = req.body;

    if (!title || !topic_id) {
      return res.status(400).json({
        message: "Title and topic_id are required",
        success: false,
      });
    }

    const note = await prisma.note.create({
      data: {
        title,
        topic_id,
        content: "[]",
        titleTimeStamp: timeStamp,
        contentTimeStamp: timeStamp,
      },
    });
    return res.status(201).json({
      message: "Note created successfully",
      success: true,
      note,
    });
  } catch (error) {
    console.error("Error creating note:", error);
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

export const updateNoteTitle = async (
  req: Request<{ id: string }, {}, { title: string; timeStamp?: Date }>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<NoteBody>>,
) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const { id } = req.params;
    const { title, timeStamp = new Date() } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Note ID is required",
        success: false,
      });
    }

    const oldData = await prisma.note.findUnique({ where: { id } });

    if (!oldData) {
      return res.status(404).json({
        message: "Note not found",
        success: false,
      });
    }

    if (oldData.title === title) {
      return res.status(200).json({
        message: "Note title updated successfully",
        success: true,
        note: oldData,
      });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title cannot be empty",
        success: false,
      });
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        title,
        titleTimeStamp: timeStamp,
      },
      include: { documents: true, reviews: true },
    });
    return res.status(200).json({
      message: "Note title updated successfully",
      success: true,
      note,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    console.error("Error updating note title:", error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      success: false,
    });
  }
};

export const updateNoteContent = async (
  req: Request<{ id: string }, {}, { content: string; timeStamp?: Date }>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<NoteBody>>,
) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const { id } = req.params;
    const { content, timeStamp = new Date() } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Note ID is required",
        success: false,
      });
    }
    const oldData = await prisma.note.findUnique({ where: { id } });

    if (!oldData) {
      return res.status(404).json({
        message: "Note not found",
        success: false,
      });
    }
    if (oldData.content === content) {
      return res.status(200).json({
        message: "Note content updated successfully",
        success: true,
        note: oldData,
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Content cannot be empty",
        success: false,
      });
    }
    const note = await prisma.note.update({
      where: { id },
      data: {
        content,
        contentTimeStamp: timeStamp,
      },
      include: { documents: true, reviews: true },
    });

    scheduleReviewJob(note.id, note.topic_id, user_id, oldData.content!);

    return res.status(200).json({
      message: "Note content updated successfully",
      success: true,
      note,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    console.error("Error updating note content:", error);
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
      orderBy: { createdAt: "desc" },
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

export const deleteNote = async (
  req: Request<{ id: string }>,
  res: Response<NoteErrorResponse | NoteSuccessResponse<null>>,
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
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
        success: false,
      });
    }

    // Get all documents
    const documents = await prisma.document.findMany({
      where: {
        notes_id: id,
      },
    });

    // Delete files from cloud storage first
    await Promise.all(
      documents.map(async (doc) => {
        const result = await handleSingleDelete(doc.public_id, doc.memetype);

        if (!result.success) {
          throw new Error(
            `Failed to delete file with public_id: ${doc.public_id}`,
          );
        }
      }),
    );

    // Delete database records in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.questionHistory.deleteMany({
        where: {
          notes_id: id,
        },
      });

      await tx.review.deleteMany({
        where: {
          notes_id: id,
        },
      });

      await tx.document.deleteMany({
        where: {
          notes_id: id,
        },
      });

      await tx.note.delete({
        where: {
          id,
        },
      });
    });

    return res.status(200).json({
      message: "Note deleted successfully",
      success: true,
      note: null,
    });
  } catch (error) {
    console.error(error);

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
