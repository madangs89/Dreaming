import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { DocumentBody } from "../../modules/document/documents.type.js";
import { prisma } from "../../configs/prisma.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { vectorStore } from "../../configs/supabaseVector.js";
const uploadDir = path.join(process.cwd(), "uploads");

export const getDocumentData = async (
  documentId: string,
): Promise<DocumentBody> => {
  const documentData = await prisma.document.findUnique({
    where: { id: documentId },
  });
  return documentData!;
};

export const downloadFileFromUrl = async (
  file: DocumentBody,
): Promise<string> => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const extension = path.extname(new URL(file.url).pathname);
    const savePath = path.join(uploadDir, `${file.title}${extension}`);

    const response = await fetch(file.url);

    if (!response.ok || !response.body) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const writeStream = fs.createWriteStream(savePath);

    await pipeline(Readable.fromWeb(response.body as any), writeStream);

    console.log("File saved:", savePath);

    return savePath;
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};

export const ragPipeline = async ({
  extractedText,
  notesId,
  documentId,
  title,
  isDocument,
  version,
}: {
  extractedText: string;
  notesId: string;
  documentId: string;
  title: string;
  version: number;
  isDocument: boolean;
}) => {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const document = new Document({
      pageContent: extractedText,
      metadata: {
        notes_id: notesId,
        document_id: documentId,
        isDocument: isDocument,
        title: title,
        version: version,
      },
    });
    const texts = await splitter.splitDocuments([document]);

    const vectorData = await vectorStore.addDocuments(texts);
    console.log("Vector data:", vectorData);
    console.log("type", typeof vectorData);
    return vectorData;
  } catch (error) {
    console.error("Error occurred while processing RAG pipeline:", error);
    throw error;
  }
};

export const deleteExistingVectors = async (
  notesId: string,
  version: number,
) => {
  try {
    const deletedCount = await prisma.$executeRaw`
  DELETE FROM rag_chunks
  WHERE metadata->>'notes_id' = ${notesId}
    AND (metadata->'isDocument')::boolean = false
    AND (metadata->>'version')::int < ${version};
`;
    console.log("Deleted rows:", deletedCount);
  } catch (error) {
    console.error("Failed to delete existing chunks:", error);
    throw error;
  }
};
