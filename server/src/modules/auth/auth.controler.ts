import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  AuthResponseFailure,
  AuthResponseSuccess,
  AuthUser,
  JwtPayload,
  LoginRequest,
  RegisterRequest,
} from "./auth.types.js";
import {
  JwtUserSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
} from "./auth.zod.js";
import { prisma, prismaErrorHandler } from "../../configs/prisma.js";
import { JWT_SECRET, NODE_ENV } from "../../configs/env.config.js";
import { Prisma } from "../../generated/prisma/client.js";

const createJwtToken = (user: JwtPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

const addCookiesToResponse = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response<AuthResponseSuccess<AuthUser> | AuthResponseFailure>,
) => {
  try {
    const result = RegisterRequestSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error,
      });
    }

    let { email, password, name = null } = result.data;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        errors: null,
      });
    }
    if (!name) {
      name = email.split("@")[0];
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
        errors: null,
      });
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        provider: "email",
      },
    });
    const token = createJwtToken({
      id: newUser.id,
      email: newUser.email,
    });
    addCookiesToResponse(res, token);
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        profile_url: newUser.profile_url ?? null,
      },
    });
  } catch (error) {
    console.log("Registration error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error,
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<AuthResponseSuccess<AuthUser> | AuthResponseFailure>,
) => {
  try {
    const result = LoginRequestSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error,
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: null,
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: null,
      });
    }
    const token = createJwtToken({
      id: user?.id,
      email: user?.email,
    });
    addCookiesToResponse(res, token);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_url: user.profile_url ?? null,
      },
    });
  } catch (error) {
    console.log("Login error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error,
    });
  }
};

export const logout = (
  req: Request,
  res: Response<AuthResponseSuccess<AuthUser> | AuthResponseFailure>,
) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error,
    });
  }
};

export const me = async (
  req: Request,
  res: Response<AuthResponseSuccess<AuthUser> | AuthResponseFailure>,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: null,
      });
    }

    const { id } = user;

    const userData = await prisma.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
      },
    });

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: userData,
    });
  } catch (error) {
    console.log("Me error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaErrorHandler(req, res, error);
      return;
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: error,
    });
  }
};
