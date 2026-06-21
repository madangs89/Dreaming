import { Worker, Job } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import {
  deleteExistingVectors,
  downloadFileFromUrl,
  getDocumentData,
  ragPipeline,
} from "./rag.helper.js";
import { RagContentJobData, RagFileJobData } from "./rag.types.js";
import { Memetype } from "../../generated/prisma/enums.js";
import { docxToText, imageToText, pdfToText } from "../../configs/ocr.js";
import { vectorStore } from "../../configs/supabaseVector.js";
import fs from "fs";
import { prisma } from "../../configs/prisma.js";
import {
  BlockNoteBlock,
  getTextContent,
  isNoteEmpty,
} from "../review/review.worker.js";

console.log("RAG worker is running...");

const ragWorker = new Worker<RagFileJobData | RagContentJobData>(
  "ragQueue",
  async (job: Job<RagFileJobData | RagContentJobData>) => {
    let filePath = "";
    try {
      switch (job.name) {
        case "rag_files": {
          const { documentId, notesId } = job.data as RagFileJobData;

          if (!documentId || !notesId) {
            throw new Error("Missing documentId or notesId in job data");
          }

          const documentData = await getDocumentData(documentId);

          if (!documentData) {
            throw new Error("Document data not found");
          }
          filePath = await downloadFileFromUrl(documentData);

          if (!filePath) {
            throw new Error("Failed to download file");
          }

          let extractedText = "";
          if (documentData.memetype == Memetype.pdf) {
            const pdfResult = await pdfToText(filePath);

            if (!pdfResult.success) {
              throw new Error("Failed to extract text from PDF");
            }
            extractedText = pdfResult.text;
          } else if (documentData.memetype == Memetype.image) {
            const imageResult = await imageToText(filePath);

            if (!imageResult.success) {
              throw new Error("Failed to extract text from image");
            }
            extractedText = imageResult.text;
          } else if (documentData.memetype == Memetype.document) {
            const docxResult = await docxToText(filePath);

            if (!docxResult.success) {
              throw new Error("Failed to extract text from docx");
            }
            extractedText = docxResult.text;
          } else {
            throw new Error("Unsupported document type");
          }

          if (extractedText.trim() === "") {
            throw new Error("Extracted text is empty");
          }

          const vectorData = await ragPipeline({
            extractedText,
            documentId,
            notesId,
            title: documentData.title,
            isDocument: true,
            version: 1,
          });

          if (!vectorData || vectorData.length === 0) {
            throw new Error("Failed to add documents to vector store");
          }

          const updatedDocument = await prisma.document.update({
            where: {
              id: documentId,
            },
            data: {
              is_indexed: true,
            },
          });

          if (!updatedDocument) {
            throw new Error("Failed to update document indexing status");
          }

          return true;
        }
        case "rag_content": {
          const { index_version, notesId } = job.data as RagContentJobData;

          console.log("Processing RAG content job for notesId:", notesId);
          if (!index_version || !notesId) {
            throw new Error("Missing index_version or notesId in job data");
          }

          const notesData = await prisma.note.findUnique({
            where: { id: notesId },
          });
          if (!notesData) {
            throw new Error("Notes data not found");
          }

          if (notesData.note_version == index_version) {
            console.log(
              "Note version is the same as index version, skipping RAG content job",
            );
            return true;
          }

          const newBlocks = JSON.parse(
            notesData.content ?? "[]",
          ) as BlockNoteBlock[];

          if (isNoteEmpty(newBlocks)) {
            throw new Error("Note content is empty");
          }

          const extractedText = getTextContent(newBlocks);

          if (extractedText.trim() === "") {
            throw new Error("Extracted text from note content is empty");
          }
          const vectorData = await ragPipeline({
            extractedText,
            notesId,
            documentId: "",
            title: notesData.title,
            isDocument: false,
            version: notesData.note_version,
          });

          if (!vectorData || vectorData.length === 0) {
            throw new Error("Failed to add note content to vector store");
          }

          await deleteExistingVectors(notesId, notesData.note_version);

          const updatedNote = await prisma.note.update({
            where: {
              id: notesId,
            },
            data: {
              index_version: notesData.note_version,
            },
          });
          if (!updatedNote) {
            throw new Error("Failed to update note index version");
          }
          return true;
        }
      }
    } catch (error) {
      console.error("Error occurred while processing RAG file job:", error);
      throw error;
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  },
  {
    connection: bullRedis,
  },
);
