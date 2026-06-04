import * as z from "zod";

export const DocumentParamSchema = z.object({
  id: z.string().uuid(),
});

