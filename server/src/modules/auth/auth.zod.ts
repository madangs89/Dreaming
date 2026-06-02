import * as z from "zod";

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  profile_url: z.string().nullable().optional(),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const JwtUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});
