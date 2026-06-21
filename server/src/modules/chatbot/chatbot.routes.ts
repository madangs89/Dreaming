import express from "express";
import { authenticate } from "../../middelwares/auth.middelware.js";
import { conversation } from "./chatbot.controler.js";

export const chatbotRouter = express.Router();

chatbotRouter.post("/conversation/:id", authenticate, conversation);
