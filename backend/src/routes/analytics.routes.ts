// src/routes/analytics.routes.ts
import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/conversations', analyticsController.getConversationLogs);
router.get('/feedback', analyticsController.getFeedbackEntries);
router.get('/stats', analyticsController.getUsageStats);
router.post('/feedback', analyticsController.recordFeedback);

export default router;
