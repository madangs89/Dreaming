import express from "express";
import { authenticate } from "../../middelwares/auth.middelware.js";
import { getRevisionAttemptDetails } from "./revisionAttempt.controler.js";

export const revisionAttemptRouter = express.Router();

revisionAttemptRouter.get("/:id", authenticate, getRevisionAttemptDetails);
