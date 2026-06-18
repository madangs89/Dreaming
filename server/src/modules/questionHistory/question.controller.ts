import { Request, Response } from "express";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
  QuestionHistoryBody,
  QuestionHistoryErrorResponse,
  QuestionHistorySuccessResponse,
} from "./question.types.js";

export const getAllQuestionForTodayRevision = async (
  req: Request<{ id: string }>,
  res: Response<
    | QuestionHistorySuccessResponse<QuestionHistoryBody[]>
    | QuestionHistoryErrorResponse
  >,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Missing id parameter", success: false });
    }

    const reviewDetails = await prisma.review.findUnique({
      where: {
        id: id,
      },
    });

    if (!reviewDetails) {
      return res
        .status(404)
        .json({ message: "Review not found", success: false });
    }

    const allQuestions = await prisma.questionHistory.findMany({
      where: {
        review_id: id,
        generation_count: reviewDetails.generation_count,
      },
    });

    return res.status(200).json({
      questions: allQuestions,
      success: true,
      message: "Got all questions",
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
