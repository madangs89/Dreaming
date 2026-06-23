import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "./env.config.js";
import { google } from "googleapis";

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "gemini-embedding-001",
  apiKey: GOOGLE_API_KEY,
});
export const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});

export const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);
