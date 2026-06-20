import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { DocumentBody } from "../../modules/document/documents.type.js";
import { prisma } from "../../configs/prisma.js";

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
