import express from "express";
import multer from "multer";
import s3 from "./config/aws.js";
import db from "./config/knex.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import cors from "cors"; // ✅ import CORS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Enable CORS so frontend (localhost:3000) can access backend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Optional: handle JSON & URL encoded data (for future REST endpoints)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage(); // ✅ buffer file in memory
const upload = multer({ storage });

// 🆕 REST endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const s3Key = `${uuidv4()}-${file.originalname}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const s3Result = await s3.upload(uploadParams).promise();

    const fileRecord = {
      id: uuidv4(),
      filename: file.originalname,
      mimetype: file.mimetype,
      encoding: "binary",
      s3_key: s3Key,
      s3_url: s3Result.Location,
    };

    await db("uploaded_files").insert(fileRecord);
    res.json(fileRecord); // ✅ client receives response here
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 REST server running at http://localhost:${PORT}`);
});
