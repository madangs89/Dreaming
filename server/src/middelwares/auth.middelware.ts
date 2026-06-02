import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/env.config.js";
import { JwtUserSchema } from "../modules/auth/auth.zod.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    console.log("Token from middleware:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET as string);

    const result = JwtUserSchema.safeParse(decoded);
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    }
    req.user = result.data;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};
