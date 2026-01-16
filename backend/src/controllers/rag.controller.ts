import { Request, Response } from 'express';
import { RagService } from '../services/rag.service';
import { multerUpload } from '../middleware/multer.middleware';

const ragService = new RagService();

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const document = await ragService.addDocument(req.file);
    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading document' });
  }
};

export const query = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'No query provided' });
    }
    const response = await ragService.query(query);
    res.status(200).json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error querying document' });
  }
};
