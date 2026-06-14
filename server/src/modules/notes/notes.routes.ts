import express from "express";
import { authenticate } from "../../middelwares/auth.middelware.js";
import {
  createNote,
  createNoteOnlyTitle,
  deleteNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  updateNoteContent,
  updateNoteTitle,
} from "./notes.controler.js";
import { upload } from "../../configs/multer.js";

export const notesRouter = express.Router();

notesRouter.get("/all/:topic_id", authenticate, getAllNotes);
notesRouter.get("/:id", authenticate, getSingleNote);
notesRouter.patch("/:id", authenticate, updateNote);
notesRouter.post(
  "/create",
  authenticate,
  upload.array("documents"),
  createNote,
);
notesRouter.post("/create/title", authenticate, createNoteOnlyTitle);
notesRouter.patch("/title/:id", authenticate, updateNoteTitle);
notesRouter.patch("/content/:id", authenticate, updateNoteContent);
notesRouter.delete("/:id", authenticate, deleteNote);
