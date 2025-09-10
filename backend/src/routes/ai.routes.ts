import express from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/chat', authenticate, aiController.chatWithGemini);
router.post('/translate', authenticate, aiController.translateWithGemini);
router.post('/translate-image', authenticate, aiController.uploadImage, aiController.translateImage);

export default router;