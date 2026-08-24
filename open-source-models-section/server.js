// server.js
import express from "express";
import { fetchImage } from './fetchImage.js'

const app = express();

app.use(express.static("public")); // serve your frontend files

app.get("/generate-image", async (req, res) => {
    try {
        const image = await fetchImage()
        const b64_json = image.toString("base64");
        res.json({ b64_json });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Image generation failed" });
    }
})

app.listen(3000, () => console.log("Server running on port 3000"));