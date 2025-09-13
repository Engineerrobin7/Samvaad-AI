import express from "express";
import { uploadPDF, chatWithPDF } from "../controllers/pdf.controller";
import { authenticate } from "../middleware/auth.middleware";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/upload", authenticate, upload.single("file"), uploadPDF);
router.post("/chat", authenticate, chatWithPDF);

export default router;