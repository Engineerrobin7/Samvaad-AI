import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads/faq/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });

export const uploadFaq = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);

    console.log("Extracted text from PDF:", data.text);

    // TODO: Implement text chunking, embedding, and storing in a vector database

    res.json({ message: 'FAQ uploaded and processed successfully', file: req.file, text: data.text });
  } catch (error) {
    res.status(500).json({ error: 'FAQ processing failed', details: error });
  }
};
