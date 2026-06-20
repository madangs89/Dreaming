import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "./env.config.js";

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "gemini-embedding-001",
  apiKey: GOOGLE_API_KEY,
});
export const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});
