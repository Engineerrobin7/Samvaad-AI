// src/controllers/ai.controller.ts
import { Request, Response } from "express";
import pool from "../db/pool";
import { aiService } from "../services/ai.service";
import multer from "multer";              // ✅ Proper ES import
import pdf from "pdf-parse";
import fs from "fs";

// ---------- Multer Configurations ----------

// General image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// PDF uploads (FAQ)
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/faq/";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

export const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }
  }
});

// Transcript uploads (PDF/TXT)
const transcriptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/transcripts/";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

export const uploadTranscript = multer({
  storage: transcriptStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and TXT files are allowed.'), false);
    }
  }
});

// ---------- In-memory Cache ----------
const pdfCache = new Map<string, string>();

// ---------- Controllers ----------

/** Upload and process a PDF */
export const uploadPdfHandler = async (req: Request, res: Response) => {
  try {
    const { conversationId, language } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: "PDF file is required" });
    if (!conversationId) return res.status(400).json({ success: false, message: "Conversation ID is required" });

    const dataBuffer = fs.readFileSync(file.path);
    const data = await pdf(dataBuffer);

    pdfCache.set(conversationId, JSON.stringify({ text: data.text, language: language || "en" }));

    res.json({ success: true, message: "PDF uploaded and processed successfully" });
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({ success: false, message: "PDF upload failed", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

/** Chat with AI about a PDF */
export const chatWithPdf = async (req: Request, res: Response) => {
  try {
    const { question, conversationId, language } = req.body;
    const userId = (req as any).user?.id;

    if (!question || !conversationId)
      return res.status(400).json({ success: false, message: "Question and Conversation ID are required" });

    const pdfData = pdfCache.get(conversationId);
    if (!pdfData)
      return res.status(404).json({ success: false, message: "PDF not found for this conversation. Please upload a PDF first." });

    const { text: pdfText, language: pdfLanguage } = JSON.parse(pdfData);
    const reply = await aiService.chatWithPdf(question, pdfText, language || pdfLanguage || "en");

    if (userId) {
      try {
        await pool.query(
          "INSERT INTO ai_conversation_logs (conversation_id, user_id, model, message, reply, language) VALUES ($1, $2, $3, $4, $5, $6)",
          [conversationId, userId, "gemini-pdf-chat", question, reply, language || pdfLanguage || "en"]
        );
      } catch (logError) {
        console.error("Failed to log PDF chat:", logError);
      }
    }

    res.json({ success: true, data: { reply, conversationId } });
  } catch (error) {
    console.error("Chat with PDF error:", error);
    res.status(500).json({ success: false, message: "Chat with PDF failed", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

/** Translate text with cultural context */
export const translateText = async (req: Request, res: Response) => {
  res.json({ success: true, translated: "Translated text" });
};

export const translateImage = async (req: Request, res: Response) => {
  res.json({ success: true, translated: "Translated image text" });
};

/** General AI chat */
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { messages, language, conversationId } = req.body;
    if (!messages || !language || !conversationId)
      return res.status(400).json({ success: false, message: "Messages, language, and conversationId are required." });

    const { reply, variant } = await aiService.chatWithAI({ language, conversationId }, messages);
    res.json({ success: true, reply, variant });
  } catch (error) {
    console.error("Chat with AI error:", error);
    res.status(500).json({ success: false, message: "Failed to get AI reply." });
  }
};

/** Clear a conversation */
export const clearChat = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId)
      return res.status(400).json({ success: false, message: "Conversation ID is required" });

    aiService.clearConversation(conversationId);
    res.json({ success: true, message: "Conversation cleared" });
  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({ success: false, message: "Failed to clear conversation" });
  }
};

/** Analyze a meeting transcript */
export const analyzeTranscriptHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "A transcript file is required." });

    let transcriptText = "";
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdf(dataBuffer);
      transcriptText = data.text;
    } else {
      transcriptText = fs.readFileSync(req.file.path, "utf-8");
    }

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error(`Failed to delete transcript file: ${req.file?.path}`, err);
    });

    if (!transcriptText.trim())
      return res.status(400).json({ success: false, message: "The uploaded file is empty or contains no text." });

    const analysis = await aiService.analyzeTranscript(transcriptText);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Transcript analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze transcript.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};