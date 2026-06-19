import express from "express";
import { authenticate } from "../../middelwares/auth.middelware.js";
import { getTodayReviews, submitReview } from "./review.controler.js";

export const reviewRouter = express.Router();

reviewRouter.get("/today", authenticate, getTodayReviews);
reviewRouter.post("/attempt/submit/:id", authenticate, submitReview);
