// src/routes/logs.routes.ts
import express from 'express';
import { getConversationLogs } from '../controllers/logs.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/conversations', authenticate, getConversationLogs);

export default router;
