import express from 'express';
import { chatWithAI, translateWithAI, chatWithGemini } from '../controllers/ai.controller';

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/gemini-chat', chatWithGemini);
router.post('/translate', translateWithAI);

export default router;