import { Request, Response } from "express";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import { AttemptStatus, Prisma } from "../../generated/prisma/client.js";
import {
  ReviewBody,
  ReviewErrorResponse,
  ReviewSuccessResponse,
} from "./review.types.js";
import { RevisionAnswerBody } from "../revisionAttempt/revisionattempt.types.js";
import { scheduleEvaluateJob } from "../../bull/review/review.jobs.js";

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
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const submitReview = async (
  req: Request<{ id: string }, {}, RevisionAnswerBody>,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const review_id = req.params.id;
    if (!review_id) {
      return res
        .status(400)
        .json({ message: "Review ID is required", success: false });
    }

    const bodyData = req.body;
    if (!bodyData) {
      return res
        .status(400)
        .json({ message: "Request body is required", success: false });
    }
    // 1 Check is already any review attempt added

    // const isAlreadyReviewAttemptAdded = await prisma.reviewAttempt.findFirst({
    //   where: {
    //     review_id: review_id,
    //     status: AttemptStatus.processing,
    //   },
    // });

    // if (isAlreadyReviewAttemptAdded) {
    //   return res.status(201).json({
    //     message: "Attempt SuccessFully Created",
    //     success: true,
    //     attempt: isAlreadyReviewAttemptAdded,
    //   });
    // }
    // 2 Not added means create new review attempt

    const newReviewAttempt = await prisma.reviewAttempt.create({
      data: {
        review_id,
      },
    });

    // 3 Push to Bull Queue
    await scheduleEvaluateJob(review_id, userId, newReviewAttempt.id, req.body);
    return res.status(201).json({
      message: "Attempt SuccessFully Created",
      success: true,
      attempt: newReviewAttempt,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }

    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
