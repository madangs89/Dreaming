import express from "express";
import cors from "cors";
import { PORT } from "./configs/env.config.js";
import { topicRouter } from "./modules/topic/topic.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import cookieParser from "cookie-parser";
import { notesRouter } from "./modules/notes/notes.routes.js";
import { documentRouter } from "./modules/document/documents.routes.js";
import { reviewRouter } from "./modules/review/review.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

let port = PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/topic", topicRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/notes", notesRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/reviews", reviewRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
