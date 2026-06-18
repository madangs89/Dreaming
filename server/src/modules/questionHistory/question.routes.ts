import express from "express";
import { authenticate } from "../../middelwares/auth.middelware.js";
import { getAllQuestionForTodayRevision } from "./question.controller.js";

export const questionHistoryRouter = express.Router();

questionHistoryRouter.get(
  "/today/:id",
  authenticate,
  getAllQuestionForTodayRevision,
);
