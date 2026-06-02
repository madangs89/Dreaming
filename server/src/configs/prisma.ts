import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import { Request, Response } from "express";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const prismaErrorHandler = (
  req: Request,
  res: Response,
  err: Prisma.PrismaClientKnownRequestError,
) => {
  if (err.code == "P2002") {
    return res.status(400).json({
      message: "Unique constraint failed",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2025") {
    return res.status(404).json({
      message: "Record not found",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2003") {
    return res.status(400).json({
      message: "Foreign key constraint failed",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2004") {
    return res.status(400).json({
      message: "A constraint failed on the database",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2005") {
    return res.status(400).json({
      message: "The value is too long for the column",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2006") {
    return res.status(400).json({
      message: "The provided value is invalid",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2007") {
    return res.status(400).json({
      message: "Data validation error",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2008") {
    return res.status(400).json({
      message: "Failed to parse the query",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2009") {
    return res.status(400).json({
      message: "Raw query failed",
      success: false,
      errors: err.meta?.target,
    });
  } else if (err.code == "P2010") {
    return res.status(400).json({
      message: "Unknown error",
      success: false,
      errors: err.meta?.target,
    });
  } else {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      errors: err.meta?.target,
    });
  }
};

export { prisma };
