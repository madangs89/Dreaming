import * as z from "zod";
import { AuthUserSchema } from "./auth.zod.js";

export type AuthUser = z.infer<typeof AuthUserSchema>;
