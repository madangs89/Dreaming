import { NextFunction, Request, Response } from "express";
import * as z from "zod";

export const validate =
  (schema: z.ZodTypeAny) =>
  (
    req: Request<{}, {}, z.infer<typeof schema>>,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error,
      });
    }
    req.body = result.data;
    next();
  };
