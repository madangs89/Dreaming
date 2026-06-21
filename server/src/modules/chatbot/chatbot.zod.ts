import * as z from "zod";
export const LLMConversationOutputSchema = z.object({
  answer: z.string(),
  isBasedOnMaterial: z.boolean(),
});
