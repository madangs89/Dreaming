import express from "express";
import { authenticate } from "../../middelwares/auth.middelware.js";
import { createNote } from "./notes.controler.js";
import { upload } from "../../configs/multer.js";

export const notesRouter = express.Router();

notesRouter.post(
  "/create",
  authenticate,
  upload.array("documents"),
  createNote,
);
