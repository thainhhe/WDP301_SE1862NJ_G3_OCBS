import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect, admin } from "../middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadPath = path.join(__dirname, "../uploads/posters");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "poster-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @desc    Upload movie poster
// @route   POST /api/upload/poster
// @access  Private/Admin
router.post("/poster", protect, admin, upload.single("poster"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the file URL
    const fileUrl = `/uploads/posters/${req.file.filename}`;
    res.json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 5MB." });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({ message: "Only image files are allowed!" });
  }

  res.status(500).json({ message: "Error uploading file" });
});

export default router;
