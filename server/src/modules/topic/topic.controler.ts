import { Request, Response } from "express";
import { Topic, TopicData, TopicParams } from "./topic.types.js";
import { TopicCreateSchema } from "./topic.zod.js";
import { handleSingleUpload } from "../../configs/cloudinary.js";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { TopicResponse } from "./topic.types.js";

export const createTopic = async (
  req: Request<{}, {}, Topic>,
  res: Response<TopicResponse<TopicData>>,
) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const result = TopicCreateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error,
        success: false,
      });
    }
    const topicData = result.data;
    const file = req.file as Express.Multer.File | undefined;

    let sourceUrl: string | null = null;
    let public_id: string | null = null;
    if (file) {
      const path = file.path!;
      const uploadResult = await handleSingleUpload(path);
      if (!uploadResult.success) {
        return res.status(400).json({
          message: uploadResult.message,
          success: false,
        });
      }

      if (!uploadResult.url?.secure_url || !uploadResult.url?.public_id) {
        return res.status(400).json({
          message: "Failed to upload file",
          success: false,
        });
      }

      sourceUrl = uploadResult.url?.secure_url;
      public_id = uploadResult.url?.public_id;
    }

    const newTopic = await prisma.topic.create({
      data: {
        title: topicData.title,
        source_url: sourceUrl,
        user_id: user_id,
        public_id: public_id,
      },
    });
    return res.status(201).json({
      message: "Topic created successfully",
      success: true,
      topic: newTopic,
    });
  } catch (error) {
    console.error("Error creating topic:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const getAllTopics = async (
  req: Request,
  res: Response<TopicResponse<TopicData[]>>,
) => {
  try {
    const { id } = req.user!;

    const topics = await prisma.topic.findMany({
      where: {
        user_id: id,
      },
    });
    return res.status(200).json({
      message: "Topics retrieved successfully",
      success: true,
      topic: topics,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const getSingleTopic = async (
  req: Request<TopicParams>,
  res: Response<TopicResponse<TopicData>>,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Topic id is required", success: false });
    }

    const topic = await prisma.topic.findUnique({
      where: {
        id,
      },
    });
    if (!topic) {
      return res
        .status(404)
        .json({ message: "Topic not found", success: false });
    }
    return res.status(200).json({
      message: "Topic retrieved successfully",
      success: true,
      topic,
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
