import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "./env.config.js";

export const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});
