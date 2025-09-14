// src/routes/assistance.routes.ts
import express from 'express';
import { requestAssistance, getAssistanceRequests } from '../controllers/assistance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/request', authenticate, requestAssistance);
router.get('/requests', authenticate, getAssistanceRequests);

export default router;
