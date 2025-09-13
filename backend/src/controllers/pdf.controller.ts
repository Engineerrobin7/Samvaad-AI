import { Request, Response } from "express";
import fs from "fs";
import pdfParse from "pdf-parse";

// In-memory store for PDF text per user/session (for demo)
const pdfStore: Record<string, string> = {};

export const uploadPDF = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const userId = req.user?.id || "demo";
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    pdfStore[userId] = data.text;
    fs.unlinkSync(req.file.path); // Clean up uploaded file
    return res.json({ message: "PDF uploaded and parsed." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to parse PDF." });
  }
};

export const chatWithPDF = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || "demo";
    const pdfText = pdfStore[userId];
    if (!pdfText) {
      return res.status(400).json({ error: "No PDF uploaded for this session." });
    }
    const { message } = req.body;
    // Simple keyword search for demo
    const found = pdfText.toLowerCase().includes(message.toLowerCase());
    let reply = found
      ? `Yes, your query was found in the PDF.`
      : `No, your query was not found in the PDF.`;
    // Optionally, return a snippet
    if (found) {
      const idx = pdfText.toLowerCase().indexOf(message.toLowerCase());
      reply += "\nSnippet: " + pdfText.substring(idx, idx + 200);
    }
    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ error: "Failed to chat with PDF." });
  }
};