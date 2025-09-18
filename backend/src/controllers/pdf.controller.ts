// src/controllers/pdf.controller.ts
import { Request, Response } from 'express';
import { documentService } from '../services/document.service';
import { aiService } from '../services/ai.service';

class PdfController {
  /**
   * Handle PDF upload and processing
   */
  async uploadPdf(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const documentName = req.body.name || req.file.originalname;
      const document = await documentService.processPdf(req.file.path, documentName);
      res.status(201).json({ message: 'PDF processed successfully', document });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to process PDF.' });
    }
  }

  /**
   * Handle chat with PDF context
   */
  async chatWithPdf(req: Request, res: Response) {
    const { question, language = 'en' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    try {
      // 1. Search for relevant document chunks
      const contextChunks = await documentService.search(question);

      if (contextChunks.length === 0) {
        return res.json({ answer: "I couldn't find any relevant information in the documents." });
      }

      // 2. Combine the context
      const context = contextChunks.map(chunk => chunk.content).join('\n---\n');

      // 3. Ask the AI to generate a response based on the context
      const answer = await aiService.chatWithPdf(question, context, language);

      res.json({ answer, context: contextChunks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to chat with PDF.' });
    }
  }
}

export const pdfController = new PdfController();
