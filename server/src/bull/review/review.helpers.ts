import { evaluationSystemInstruction } from "../../ai/systemInstruction/instruction.js";
import { ai } from "../../configs/google.js";
import { prisma } from "../../configs/prisma.js";
import { AttemptStatus } from "../../generated/prisma/enums.js";
import { DocumentBody } from "../../modules/notes/notes.types.js";
import { ReviewBody } from "../../modules/review/review.types.js";
import { LLmEvaluationData, LLmEvaluationSchema } from "./review.job.type.js";

export const getReviewDetails = async (
  review_id: string,
): Promise<ReviewBody> => {
  const review = await prisma.review.findUnique({
    where: { id: review_id },
    include: {
      topic: true,
      notes: true,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }
  return review;
};

export const getDocumentData = async (
  notes_id: string,
): Promise<DocumentBody[]> => {
  const documentData = await prisma.document.findMany({
    where: { notes_id },
  });
  return documentData;
};

export const llmAnswerEvaluation = async (
  attempt_id: string,
  prompt: string,
): Promise<LLmEvaluationData> => {
  const contents: any[] = [{ text: prompt }];
  console.log("got request for evaluation with prompt:");

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents,
        config: {
          systemInstruction: evaluationSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "Object",
            properties: {
              score: { type: "number" },
              rememberStatus: {
                type: "string",
                enum: ["easy", "partial", "forgot"],
              },
              strong_areas: {
                type: "array",
                items: { type: "string" },
              },
              weak_areas: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["score", "rememberStatus", "strong_areas", "weak_areas"],
          },
        },
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const rawData = JSON.parse(response.text);

      console.log(rawData);

      const parsedData = LLmEvaluationSchema.safeParse(rawData);

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
        const updateAttemptAsFailed = await prisma.reviewAttempt.update({
          where: { id: attempt_id },
          data: {
            status: AttemptStatus.failed,
          },
        });
        throw error;
      }
    }
  }

  throw new Error("Failed to generate questions");
};
