import { ThinkingLevel } from "@google/genai/web";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as z from "zod";
import mime from "mime-types";
import { prisma } from "../../configs/prisma.js";
import { QuestionHistoryBody } from "../../modules/questionHistory/question.types.js";
import { ReviewBody } from "../../modules/review/review.types.js";
import { DocumentBody } from "../../modules/document/documents.type.js";
import {
  GenerationWorthinessData,
  GenerationWorthinessSchema,
  LLMQuestionData,
  LLMQuestionSchema,
} from "./question.bull.type.js";
import {
  isWorthGeneratingQuizInstruction,
  scheduleReviewInstruction,
} from "../../ai/systemInstruction/instruction.js";
import { ai } from "../../configs/google.js";
import { getDocumentData } from "../review/review.helpers.js";

async function fileToGenerativePart(url: string, explicitMimeType?: string) {
  // Look up by URL first. If that fails, fallback to the explicit type from your DB.
  const determinedMimeType = mime.lookup(url) || "application/octet-stream";

  let targetUrl = url;

  if (url.includes("cloudinary.com")) {
    // Check both the determined mime type AND the URL string as a safety net
    if (
      determinedMimeType === "application/pdf" ||
      url.toLowerCase().includes(".pdf")
    ) {
      targetUrl = url.replace("/upload/", "/upload/fl_attachment/");
    }
  }

  const response = await fetch(targetUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch document from source: ${response.statusText} (${response.status})`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  // If mime lookup failed completely, default to a safe standard image type
  // so Gemini doesn't reject an 'application/octet-stream'
  const finalMimeType =
    determinedMimeType === "application/octet-stream"
      ? "image/jpeg"
      : determinedMimeType;

  return {
    inlineData: {
      data: base64Data,
      mimeType: finalMimeType,
    },
  };
}

export const getReviewQuestionHistory = async (
  review_id: string,
): Promise<QuestionHistoryBody[]> => {
  const questionHistory = await prisma.questionHistory.findMany({
    where: { review_id },
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
  });
  return questionHistory;
};

export const llmCreateQuestions = async (
  reviewDetails: ReviewBody,
  questionHistory: QuestionHistoryBody[],
  documentData: DocumentBody[],
): Promise<LLMQuestionData[]> => {
  console.log("got the request to generate questions for review:");
  const processedQuestionHistory = questionHistory.map((question) => ({
    question: question.question,
  }));

  const totalReviewCount = reviewDetails.review_count;
  const weakAreas = reviewDetails.weak_areas;
  const strongAreas = reviewDetails.strong_areas;
  const noteContent = reviewDetails.notes.content;

  const prompt = `
Review Count: ${totalReviewCount}

Strong Areas:
${strongAreas?.join("\n") || "None"}

Weak Areas:
${weakAreas?.join("\n") || "None"}

Study Notes:
${noteContent || "No notes available"}

Previously Asked Questions:
${
  processedQuestionHistory.length > 0
    ? processedQuestionHistory.map((q) => `- ${q.question}`).join("\n")
    : "No previous questions"
}
`;

  const contents: any[] = [{ text: prompt }];

  if (documentData.length > 0) {
    const fileParts = await Promise.allSettled(
      documentData.map((document) =>
        fileToGenerativePart(document.url, document.memetype),
      ),
    );

    contents.push(
      ...fileParts
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value),
    );
  }

  const arraySchema = z.array(LLMQuestionSchema);
  const jsonSchema = zodToJsonSchema(arraySchema as any);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: scheduleReviewInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                difficulty: {
                  type: "STRING",
                  enum: ["easy", "medium", "hard"],
                },
                question_type: {
                  type: "STRING",
                  enum: ["text", "coding"],
                },
                expectedAnswer: {
                  type: "STRING",
                },
              },
              required: [
                "question",
                "difficulty",
                "question_type",
                "expectedAnswer",
              ],
            },
          },
        },
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const rawData = JSON.parse(response.text);

      const parsedData = z.array(LLMQuestionSchema).safeParse(rawData);

      if (!parsedData.success) {
        console.error(parsedData.error.flatten());
        throw new Error("Invalid response schema");
      }
      return parsedData.data;
    } catch (error) {
      console.error(
        `Question generation failed (attempt ${attempt}/3):`,
        error,
      );

      if (attempt === 3) {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate questions");
};

export const llmCheckContentWorthToGenerateQuiz = async (
  content: string,
  documentData: DocumentBody[],
): Promise<GenerationWorthinessData> => {
  let prompt = `
  Study Notes:
  ${content || "No notes available"}
  `;

  const contents: any[] = [{ text: prompt }];

  if (documentData.length > 0) {
    const fileParts = await Promise.allSettled(
      documentData.map((document) =>
        fileToGenerativePart(document.url, document.memetype),
      ),
    );

    contents.push(
      ...fileParts
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value),
    );
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents,
        config: {
          systemInstruction: isWorthGeneratingQuizInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              isWorthGeneratingQuiz: { type: "BOOLEAN" },
            },
            required: ["isWorthGeneratingQuiz"],
          },
        },
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const rawData = JSON.parse(response.text);

      const parsedData = GenerationWorthinessSchema.safeParse(rawData);

      if (!parsedData.success) {
        console.error(parsedData.error.flatten());
        throw new Error("Invalid response schema");
      }
      return parsedData.data;
    } catch (error) {
      console.error(
        `Question generation failed (attempt ${attempt}/3):`,
        error,
      );

      if (attempt === 3) {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate questions");
};
