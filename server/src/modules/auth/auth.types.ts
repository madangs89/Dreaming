import * as z from "zod";
import {
  AuthUserSchema,
  JwtUserSchema,
  RegisterRequestSchema,
} from "./auth.zod.js";

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export type JwtPayload = z.infer<typeof JwtUserSchema>;

export type AuthResponseSuccess<T> = {
  success: boolean;
  message: string;
  token?: string;
  data?: T;
};

export type AuthResponseFailure = {
  success: boolean;
  message: string;
  errors?: unknown;
};
