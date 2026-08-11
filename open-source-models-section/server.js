// server.js
import express from "express";
import { huggingFaceFunction } from './huggingFaceFunction.js';

const app = express();

app.use(express.static("public")); // serve your frontend files

app.get("/chat", async (req, res) => {
     try {
    const text = await huggingFaceFunction();
    res.json({ text });
    console.log(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "HF setup failed failed" });
  }
})

app.listen(3000, () => console.log("Server running on port 3000"));