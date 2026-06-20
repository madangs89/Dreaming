import { Worker, Job } from "bullmq";
import { bullRedis } from "../../configs/redis.js";
import { downloadFileFromUrl, getDocumentData } from "./rag.helper.js";
import { RagFileJobData } from "./rag.types.js";
import { Memetype } from "../../generated/prisma/enums.js";
import { docxToText, imageToText, pdfToText } from "../../configs/ocr.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { vectorStore } from "../../configs/supabaseVector.js";
import fs from "fs";
import { prisma } from "../../configs/prisma.js";

console.log("RAG worker is running...");

const ragWorker = new Worker<RagFileJobData>(
  "ragQueue",
  async (job: Job<RagFileJobData>) => {
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

          const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100,
          });

          const document = new Document({
            pageContent: extractedText,
            metadata: { notes_id: notesId, document_id: documentId },
          });
          const texts = await splitter.splitDocuments([document]);

          const vectorData = await vectorStore.addDocuments(texts);
          console.log("Vector data:", vectorData);

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
