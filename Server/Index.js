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

// get all files
app.get("/files", async (req, res) => {
  try {
    const files = await db("uploaded_files").select("*");
    res.json(files);
  } catch (error) {
    console.error("Failed to fetch files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// 🆕 REST endpoint to delete a file by ID
app.delete("/files/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch the file record from the database
    const fileRecord = await db("uploaded_files").where({ id }).first();
    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete the file from S3
    const deleteParams = {
      Bucket: process.env.S3_BUCKET,
      Key: fileRecord.s3_key,
    };
    await s3.deleteObject(deleteParams).promise();

    try {
      // Delete the record from the database
      await db("uploaded_files").where({ id }).del();
      res.json({ message: "File deleted successfully" });
    } catch (dbError) {
      // Rollback: Re-upload the file to S3 if DB deletion fails
      const rollbackParams = {
        Bucket: process.env.S3_BUCKET,
        Key: fileRecord.s3_key,
        Body: fileRecord.buffer, // Ensure you have the file buffer stored
      };
      await s3.upload(rollbackParams).promise();
      throw dbError;
    }
  } catch (error) {
    console.error("Failed to delete file:", error);
    res
      .status(500)
      .json({ error: "Failed to delete file", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 REST server running at http://localhost:${PORT}`);
});
