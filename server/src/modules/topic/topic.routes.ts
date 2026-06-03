import express from "express";
import {
  createTopic,
  getAllTopics,
  getSingleTopic,
  updateTopic,
} from "./topic.controler.js";
import { upload } from "../../configs/multer.js";
import { authenticate } from "../../middelwares/auth.middelware.js";

export const topicRouter = express.Router();

topicRouter.post("/create", authenticate, upload.single("source"), createTopic);
topicRouter.get("/all", authenticate, getAllTopics);
topicRouter.get("/:id", authenticate, getSingleTopic);
topicRouter.patch("/:id", authenticate, upload.single("source"), updateTopic);
