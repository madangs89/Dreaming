import { pdf } from "pdf-to-img";
import Tesseract from "tesseract.js";
import fs from "fs";
import mammoth from "mammoth";
export const pdfToText = async (
  pdfPath: string,
): Promise<{ text: string; success: boolean }> => {
  try {
    console.log("Starting PDF to Text conversion for:", pdfPath);

    if (!fs.existsSync(pdfPath)) {
      console.error("PDF file does not exist:", pdfPath);
      return {
        text: "",
        success: false,
      };
    }

    let finalText = "";

    const document = await pdf(pdfPath);

    let pageCount = 0;

    for await (const image of document) {
      pageCount++;

      console.log(`Processing page ${pageCount}`);

      const result = await Tesseract.recognize(image, "eng");

      finalText += result.data.text + "\n\n";
    }

    if (pageCount === 0) {
      console.error("No pages found in PDF");
      return {
        text: "",
        success: false,
      };
    }

    return {
      text: finalText.trim(),
      success: true,
    };
  } catch (error) {
    console.error("Error converting PDF to text:", error);

    return {
      text: "",
      success: false,
    };
  }
};

export const imageToText = async (imagePath: string) => {
  const result = await Tesseract.recognize(imagePath, "eng");

  return {
    text: result.data.text,
    success: true,
  };
};

export const docxToText = async (filePath: string) => {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return {
    text: result.value,
    success: true,
  };
};
