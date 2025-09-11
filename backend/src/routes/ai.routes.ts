import express from 'express';
import { translateText, translateImage, chatWithAI, clearChat, upload } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Translation routes
router.post('/translate', authenticate, translateText);
router.post('/translate-image', authenticate, upload.single('image'), translateImage);

// Chat routes
router.post('/chat', authenticate, chatWithAI);
router.delete('/chat/:conversationId', authenticate, clearChat);

export default router;
