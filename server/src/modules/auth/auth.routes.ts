import express from "express";
import { login, logout, me, register } from "./auth.controler.js";
import { authenticate } from "../../middelwares/auth.middelware.js";

export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, me);
