import { Request, Response } from "express";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
  ReviewBody,
  ReviewErrorResponse,
  ReviewSuccessResponse,
} from "./review.types.js";

export const getTodayReviews = async (
  req: Request,
  res: Response<ReviewErrorResponse | ReviewSuccessResponse<ReviewBody[]>>,
) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const reviews = await prisma.review.findMany({
      where: {
        scheduled_date: {
          lte: today,
        },
        user_id,
        is_completed: false,
      },
      include: {
        notes: true,
        topic: true,
      },
    });
    return res.status(200).json({
      review: reviews,
      success: true,
      message: "Reviews retrieved successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
