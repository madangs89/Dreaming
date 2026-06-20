import { Request, Response } from "express";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import {
  RevisionAttemptBody,
  RevisionAttemptErrorResponse,
  RevisionAttemptSuccessResponse,
} from "./revisionattempt.types.js";
import { Prisma } from "../../generated/prisma/client.js";

export const getRevisionAttemptDetails = async (
  req: Request<{ id: string }>,
  res: Response<
    | RevisionAttemptSuccessResponse<RevisionAttemptBody>
    | RevisionAttemptErrorResponse
  >,
) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Missing id parameter", success: false });
    }

    const revisionAttempt = await prisma.reviewAttempt.findUnique({
      where: { id },
    });
    if (!revisionAttempt) {
      return res
        .status(404)
        .json({ message: "Revision attempt not found", success: false });
    }
    return res.json({
      attempt: revisionAttempt,
      success: true,
      message: "Revision attempt retrieved successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
