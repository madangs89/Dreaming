import { Request, Response } from "express";
import { Topic } from "./topic.types.js";
import { TopicCreateSchema } from "./topic.zod.js";

export const createTopic = async (
  req: Request<{}, {}, Topic>,
  res: Response,
) => {
  try {
    const result = TopicCreateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error,
      });
    }
    const user_id = req.user?.id;
    const topicData = result.data;
    const file = req.file as Express.Multer.File | unknown;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    if (file) {
    }
  } catch (error) {
    console.error("Error creating topic:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
