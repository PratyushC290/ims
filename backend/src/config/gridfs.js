import multer from "multer";
import { getBucket } from "./db.js";
import { Readable } from "stream";

// Use memory storage for temporary file buffer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

export const uploadToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    if (!bucket) return reject(new Error("GridFS bucket not initialized"));

    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream)
      .on("error", (error) => reject(error))
      .on("finish", () => resolve(uploadStream.id));
  });
};

export const streamFromGridFS = (fileId, res) => {
  const bucket = getBucket();
  if (!bucket) return res.status(500).json({ message: "GridFS bucket not initialized" });

  const downloadStream = bucket.openDownloadStream(fileId);

  downloadStream.on("error", (error) => {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(500).json({ message: "Error streaming file", error: error.message });
  });

  downloadStream.pipe(res);
};
