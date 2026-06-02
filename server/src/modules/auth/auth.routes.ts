import express from "express";
import { register } from "./auth.controler.js";

export const authRouter = express.Router();

authRouter.post("/register", register);
