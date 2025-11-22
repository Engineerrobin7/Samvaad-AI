import { Router } from 'express';
import * as collaborationController from '../controllers/collaboration.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/session', authenticateToken, collaborationController.createSession);
router.post('/:sessionId/annotation', authenticateToken, collaborationController.addAnnotation);
router.put('/:sessionId/annotation/:annotationId/resolve', authenticateToken, collaborationController.resolveAnnotation);
router.get('/:sessionId/annotations', authenticateToken, collaborationController.getAnnotations);
router.get('/:sessionId/summary', authenticateToken, collaborationController.generateSummary);
router.post('/:sessionId/participant', authenticateToken, collaborationController.addParticipant);

export default router;
