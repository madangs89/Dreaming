import express from "express";
import {
  createDocument,
  deleteDocument,
  getAllDocuments,
} from "./document.controler.js";
import { authenticate } from "../../middelwares/auth.middelware.js";
import { upload } from "../../configs/multer.js";

export const documentRouter = express.Router();

documentRouter.post(
  "/create",
  authenticate,
  upload.single("document"),
  createDocument,
);

documentRouter.delete("/:id", authenticate, deleteDocument);
documentRouter.get("/notes/:notes_id", authenticate, getAllDocuments);
