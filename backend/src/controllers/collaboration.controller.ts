import { Request, Response } from 'express';
import collaborationService from '../services/collaboration.service';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.body;
    const userId = (req as any).userId;

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const session = await collaborationService.createSession(documentId, userId);
    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addAnnotation = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { text, position } = req.body;
    const userId = (req as any).userId;

    if (!text || !position) {
      return res.status(400).json({ error: 'Text and position are required' });
    }

    const annotation = await collaborationService.addAnnotation(
      sessionId,
      userId,
      text,
      position
    );

    res.json({ success: true, annotation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resolveAnnotation = async (req: Request, res: Response) => {
  try {
    const { sessionId, annotationId } = req.params;

    const resolved = await collaborationService.resolveAnnotation(sessionId, annotationId);
    res.json({ success: true, resolved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnnotations = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const annotations = await collaborationService.getSessionAnnotations(sessionId);
    res.json({ success: true, annotations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const summary = await collaborationService.generateSummary(sessionId);
    res.json({ success: true, summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addParticipant = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const added = await collaborationService.addParticipant(sessionId, userId);
    res.json({ success: true, added });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
