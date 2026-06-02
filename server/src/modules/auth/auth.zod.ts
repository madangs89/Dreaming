import * as z from "zod";

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  profile_url: z.string().optional(),
});
