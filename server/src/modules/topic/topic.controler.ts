import { Request, Response } from "express";
import { Topic, TopicData } from "./topic.types.js";
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
    const result = TopicCreateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error,
        success: false,
      });
    }
    const user_id = req.user?.id;
    const topicData = result.data;
    const file = req.file as Express.Multer.File | unknown;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    let sourceUrl: string | null = null;
    if (file) {
      let path = file.path!;
      const uploadResult = await handleSingleUpload(path);
      if (!uploadResult.success) {
        return res.status(400).json({
          message: uploadResult.message,
          success: false,
        });
      }
      if (uploadResult.success) {
        sourceUrl = uploadResult.url;
      }
    }

    const newTopic = await prisma.topic.create({
      data: {
        title: topicData.title,
        source_url: sourceUrl,
        user_id: user_id,
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
