import { Request, Response } from 'express';
import collaborationService from '../services/collaboration.service.js';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { name, sourceLanguage, targetLanguage } = req.body;
    const userId = (req as any).userId;

    if (!name || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await collaborationService.createSession(
      name,
      userId,
      sourceLanguage,
      targetLanguage
    );

    // Add creator as participant
    await collaborationService.addParticipant(session.id, userId);

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating collaboration session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await collaborationService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

export const addParticipant = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    await collaborationService.addParticipant(sessionId, userId);
    res.json({ message: 'Participant added successfully' });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
};

export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const { sessionId, userId } = req.params;

    await collaborationService.removeParticipant(sessionId, userId);
    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
};

export const addTranslation = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { sourceText, translatedText } = req.body;
    const userId = (req as any).userId;

    if (!sourceText || !translatedText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const translation = await collaborationService.addTranslation(
      sessionId,
      sourceText,
      translatedText,
      userId
    );

    res.status(201).json(translation);
  } catch (error) {
    console.error('Error adding translation:', error);
    res.status(500).json({ error: 'Failed to add translation' });
  }
};

export const updateTranslationStatus = async (req: Request, res: Response) => {
  try {
    const { translationId } = req.params;
    const { status } = req.body;

    if (!['draft', 'review', 'approved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await collaborationService.updateTranslationStatus(translationId, status);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const voteTranslation = async (req: Request, res: Response) => {
  try {
    const { translationId } = req.params;
    const { vote } = req.body;
    const userId = (req as any).userId;

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ error: 'Vote must be 1 or -1' });
    }

    const totalVotes = await collaborationService.voteTranslation(
      translationId,
      userId,
      vote
    );

    res.json({ votes: totalVotes });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { translationId } = req.params;
    const { text } = req.body;
    const userId = (req as any).userId;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await collaborationService.addComment(
      translationId,
      userId,
      text
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const getSessionTranslations = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const translations = await collaborationService.getSessionTranslations(sessionId);

    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
};

export const addAnnotation = async (req: Request, res: Response) => {
  try {
    const { translationId } = req.params;
    const { text, position } = req.body;
    const userId = (req as any).userId;

    if (!text || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return res.status(400).json({ error: 'Invalid annotation data' });
    }

    const annotation = await collaborationService.addAnnotation(
      translationId,
      userId,
      text,
      position
    );

    res.status(201).json(annotation);
  } catch (error) {
    console.error('Error adding annotation:', error);
    res.status(500).json({ error: 'Failed to add annotation' });
  }
};

export const getAnnotations = async (req: Request, res: Response) => {
  try {
    const { translationId } = req.params;
    const annotations = await collaborationService.getAnnotations(translationId);

    res.json(annotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const sessions = await collaborationService.getUserSessions(userId);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

export const exportSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const exportData = await collaborationService.exportSession(sessionId);

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting session:', error);
    res.status(500).json({ error: 'Failed to export session' });
  }
};
