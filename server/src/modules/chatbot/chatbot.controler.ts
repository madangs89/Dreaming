import { Request, Response } from "express";
import { prisma } from "../../configs/prisma.js";
import {
  BlockNoteBlock,
  getTextContent,
  isNoteEmpty,
} from "../../bull/review/review.worker.js";
import { vectorStore } from "../../configs/supabaseVector.js";
import { SupabaseFilterRPCCall } from "@langchain/community/vectorstores/supabase";
import { RagReturnedData } from "./chatbot.types.js";
import { ai } from "../../configs/google.js";
import { conversationSystemInstruction } from "../../ai/systemInstruction/instruction.js";
import { LLMConversationOutputSchema } from "./chatbot.zod.js";

export const conversation = async (
  req: Request<
    { id: string },
    {},
    {
      query: string;
      history: { role: string; content: string }[];
    }
  >,
  res: Response,
) => {
  try {
    const notesId = req.params.id;
    const { query, history } = req.body;

    if (!notesId) {
      return res
        .status(400)
        .json({ message: "Notes ID is required", success: false });
    }

    if (!query) {
      return res
        .status(400)
        .json({ message: "Query is required", success: false });
    }

    const notedData = await prisma.note.findUnique({
      where: { id: notesId },
    });
    if (!notedData) {
      return res
        .status(404)
        .json({ message: "Notes not found", success: false });
    }

    const newBlocks = JSON.parse(notedData.content ?? "[]") as BlockNoteBlock[];

    let contentText = getTextContent(newBlocks);

    const funcFilterA: SupabaseFilterRPCCall = (rpc) =>
      rpc
        .filter("metadata->notes_id::string", "eq", JSON.stringify(notesId))
        .filter("metadata->isDocument::boolean", "eq", true);

    const documentText = (await vectorStore.similaritySearch(
      query,
      5,
      funcFilterA,
    )) as RagReturnedData[];

    // console.log({ documentText: documentText.map((d) => d.pageContent) });

    if (contentText.trim() === "" && documentText.length === 0) {
      return res.status(400).json({
        message: "Extracted text from note content is empty",
        success: false,
      });
    }

    let content;
    if (contentText.trim().length > 500) {
      const funcFilterB: SupabaseFilterRPCCall = (rpc) =>
        rpc
          .filter("metadata->notes_id::string", "eq", JSON.stringify(notesId))
          .filter("metadata->isDocument::boolean", "eq", false);
      content = (await vectorStore.similaritySearch(
        query,
        5,
        funcFilterB,
      )) as RagReturnedData[];
    } else {
      content = [
        {
          pageContent: contentText,
          metadata: {},
        },
      ];
    }

    // console.log({ content: content.map((c) => c.pageContent) });
    const prompt = `
    User Query: ${query}

    Note content: ${content.map((c) => c.pageContent).join("\n")}

    Document content: ${documentText.map((d) => d.pageContent).join("\n")}

    History: ${JSON.stringify(history.map((h) => `${h.role}: ${h.content}`).join("\n"))}

    Please provide a response based on the above information.
    `;
    const data = await llmConversation(prompt);
    const source = [...documentText, ...content].map((d) => d.metadata);
    res.status(200).json({ message: "Success", success: true, data, source });
  } catch (error) {
    console.error("Error in conversation controller:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const llmConversation = async (prompt: string) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ text: prompt }],
        config: {
          systemInstruction: conversationSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              answer: { type: "string" },
              isBasedOnMaterial: { type: "boolean" },
            },
            required: ["answer" , "isBasedOnMaterial"],
          },
        },
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const rawData = JSON.parse(response.text);

      console.log({ rawData });

      const parsedData = LLMConversationOutputSchema.safeParse(rawData);

      if (!parsedData.success) {
        console.error(parsedData.error.flatten());
        throw new Error("Invalid response schema");
      }
      return parsedData.data;
    } catch (error) {
      console.error(`Attempt ${attempt} - Error in LLM conversation:`, error);
      if (attempt === 3) {
        throw error;
      }
    }
  }

  throw new Error("Failed to get response from LLM after 3 attempts");
};
