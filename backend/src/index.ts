import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use("/api", chatRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log('OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);
});
