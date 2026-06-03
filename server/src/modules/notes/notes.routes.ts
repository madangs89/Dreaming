import express from "express";
import { authenticate } from "../../middelwares/auth.middelware.js";
import { createNote, getAllNotes, getSingleNote } from "./notes.controler.js";
import { upload } from "../../configs/multer.js";

export const notesRouter = express.Router();

notesRouter.get("/all/:topic_id", authenticate, getAllNotes);
notesRouter.get("/:id", authenticate, getSingleNote);
notesRouter.post(
  "/create",
  authenticate,
  upload.array("documents"),
  createNote,
);
