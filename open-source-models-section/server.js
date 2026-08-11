// server.js
import express from "express";
import { textSummarization } from './huggingFaceFunction.js';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(express.static("public")); // serve your frontend files

app.get("/chat", async (req, res) => {
     try {
    const text = await textSummarization();
    res.json({ text });
    console.log(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "HF setup failed failed" });
  }
})

app.listen(3000, () => console.log("Server running on port 3000"));