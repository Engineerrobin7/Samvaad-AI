import { Router } from 'express';
import * as collaborationController from '../controllers/collaboration.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Session management
router.post('/sessions', collaborationController.createSession);
router.get('/sessions/:sessionId', collaborationController.getSession);
router.get('/sessions', collaborationController.getUserSessions);
router.post('/sessions/:sessionId/export', collaborationController.exportSession);

// Participant management
router.post('/sessions/:sessionId/participants', collaborationController.addParticipant);
router.delete('/sessions/:sessionId/participants/:userId', collaborationController.removeParticipant);

// Translation management
router.post('/sessions/:sessionId/translations', collaborationController.addTranslation);
router.get('/sessions/:sessionId/translations', collaborationController.getSessionTranslations);
router.patch('/translations/:translationId/status', collaborationController.updateTranslationStatus);

// Voting
router.post('/translations/:translationId/vote', collaborationController.voteTranslation);

// Comments
router.post('/translations/:translationId/comments', collaborationController.addComment);

// Annotations
router.post('/translations/:translationId/annotations', collaborationController.addAnnotation);
router.get('/translations/:translationId/annotations', collaborationController.getAnnotations);

export default router;
