import { Request, Response } from "express";
import {
  handleSingleDelete,
  handleSingleUpload,
} from "../../configs/cloudinary.js";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import { getMemetype } from "../notes/notes.controler.js";
import {
  DocumentBody,
  DocumentErrorResponse,
  DocumentParams,
  DocumentSuccessResponse,
} from "./documents.type.js";
import { DocumentParamSchema } from "./documents.zod.js";

export const createDocument = async (
  req: Request<
    {},
    {},
    {
      notes_id: string;
    }
  >,
  res: Response<DocumentSuccessResponse<DocumentBody> | DocumentErrorResponse>,
) => {
  try {
    const { notes_id } = req.body;

    if (!notes_id) {
      return res
        .status(400)
        .json({ message: "Notes ID is required", success: false });
    }

    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      return res
        .status(400)
        .json({ message: "File is required", success: false });
    }

    const uploadFile = await handleSingleUpload(file?.path);

    if (!uploadFile.success) {
      return res
        .status(500)
        .json({ message: "Error uploading file", success: false });
    }

    if (!uploadFile.url?.public_id || !uploadFile.url?.secure_url) {
      return res
        .status(500)
        .json({ message: "Invalid upload response", success: false });
    }
    const payload: Prisma.DocumentCreateManyInput = {
      notes_id,
      url: uploadFile.url?.secure_url,
      public_id: uploadFile.url?.public_id,
      title: file.originalname,
      memetype: getMemetype(file.mimetype),
    };

    const document = await prisma.document.create({
      data: payload,
    });
    return res.status(201).json({
      message: "Document created successfully",
      document,
      success: true,
    });
  } catch (error) {
    console.error("Error creating document:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const deleteDocument = async (
  req: Request<DocumentParams>,
  res: Response<DocumentSuccessResponse<null> | DocumentErrorResponse>,
) => {
  try {
    const result = DocumentParamSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid document ID",
        success: false,
        errors: result.error.format(),
      });
    }

    const { id } = result.data;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
        success: false,
      });
    }

    const handleDeleteFiles = await handleSingleDelete(document.public_id);

    if (!handleDeleteFiles.success) {
      return res.status(500).json({
        message: "Error deleting file from cloudinary",
        success: false,
      });
    }

    await prisma.document.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Document deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting document:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getAllDocuments = async (
  req: Request<{ notes_id: string }>,
  res: Response<
    DocumentSuccessResponse<DocumentBody[]> | DocumentErrorResponse
  >,
) => {
  try {
    const { notes_id } = req.params;

    if (!notes_id) {
      return res.status(400).json({
        message: "Notes ID is required",
        success: false,
      });
    }

    const documents = await prisma.document.findMany({
      where: { notes_id },
    });
    return res.status(200).json({
      message: "Documents retrieved successfully",
      success: true,
      document: documents,
    });
  } catch (error) {
    console.error("Error retrieving documents:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
