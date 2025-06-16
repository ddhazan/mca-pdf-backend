import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// 🚀 Bolt will send the file here
app.post("/api/upload-bank-statement", upload.single("file"), async (req, res) => {
  const file = req.file;
  const zapierWebhook = process.env.ZAPIER_WEBHOOK_URL;

  const form = new FormData();
  form.append("file", fs.createReadStream(file.path));
  form.append("merchantId", req.body?.merchantId || "unknown");

  try {
    await axios.post(zapierWebhook, form, {
      headers: form.getHeaders(),
    });
    res.status(200).json({ message: "Uploaded to Zapier. Awaiting parsing." });
  } catch (err) {
    console.error("Zapier upload failed:", err.message);
    res.status(500).json({ error: "Zapier forward failed." });
  }
});

// 🚀 Zapier sends parsed JSON here
app.post("/api/zapier-callback", async (req, res) => {
  console.log("Received parsed data from Zapier:", req.body);
  res.status(200).json({ message: "Parsed data received successfully." });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
