import { Request, Response } from 'express';
import { multiDocumentService } from '../services/multiDocument.service';
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: 'uploads/documents/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('document');

export const addDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required',
      });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const fileType = req.file.originalname.endsWith('.pdf') ? 'pdf' : 'text';
    const document = await multiDocumentService.addDocument(
      sessionId,
      req.file.path,
      req.file.originalname,
      fileType
    );

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Add document error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add document',
    });
  }
};

export const chatWithDocuments = async (req: Request, res: Response) => {
  try {
    const { sessionId, question, language = 'en' } = req.body;

    if (!sessionId || !question) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and question are required',
      });
    }

    const answer = await multiDocumentService.chatWithDocuments(sessionId, question, language);

    return res.status(200).json({
      success: true,
      data: { answer },
    });
  } catch (error) {
    console.error('Chat with documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to chat with documents',
    });
  }
};

export const summarizeDocuments = async (req: Request, res: Response) => {
  try {
    const { sessionId, language = 'en' } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const summary = await multiDocumentService.summarizeDocuments(sessionId, language);

    return res.status(200).json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    console.error('Summarize documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to summarize documents',
    });
  }
};

export const compareDocuments = async (req: Request, res: Response) => {
  try {
    const { sessionId, aspect, language = 'en' } = req.body;

    if (!sessionId || !aspect) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and comparison aspect are required',
      });
    }

    const comparison = await multiDocumentService.compareDocuments(sessionId, aspect, language);

    return res.status(200).json({
      success: true,
      data: { comparison },
    });
  } catch (error) {
    console.error('Compare documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compare documents',
    });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const documents = multiDocumentService.getDocuments(sessionId);

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents',
    });
  }
};

export const removeDocument = async (req: Request, res: Response) => {
  try {
    const { sessionId, documentId } = req.params;

    if (!sessionId || !documentId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and document ID are required',
      });
    }

    const removed = multiDocumentService.removeDocument(sessionId, documentId);

    return res.status(200).json({
      success: true,
      data: { removed },
    });
  } catch (error) {
    console.error('Remove document error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove document',
    });
  }
};
