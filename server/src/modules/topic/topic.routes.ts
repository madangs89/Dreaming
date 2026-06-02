import express from "express";
import { createTopic } from "./topic.controler.js";
import { upload } from "../../configs/multer.js";

export const topicRouter = express.Router();

topicRouter.post("/create", upload.single("source"), createTopic);
