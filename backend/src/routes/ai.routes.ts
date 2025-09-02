import express from 'express';
import { chatWithAI, translateWithAI } from '../controllers/ai.controller';

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/translate', translateWithAI);

export default router;