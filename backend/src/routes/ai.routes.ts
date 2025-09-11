import express from 'express';
import { translateText, translateImage, chatWithAI, clearChat, upload } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Add a root endpoint for API documentation
router.get('/', (req, res) => {
  res.json({
    message: 'AI-powered translation and chat',
    available_routes: [
      { method: 'POST', path: '/translate', description: 'Translates a piece of text.' },
      { method: 'POST', path: '/translate-image', description: 'Translates the text found in an uploaded image.' },
      { method: 'POST', path: '/chat', description: 'Handles chat messages with the AI.' },
      { method: 'DELETE', path: '/chat/:conversationId', description: 'Clears the history of an AI chat conversation.' }
    ]
  });
});

// Translation routes
router.post('/translate', authenticate, translateText);
router.post('/translate-image', authenticate, upload.single('image'), translateImage);

// Chat routes
router.post('/chat', authenticate, chatWithAI);
router.delete('/chat/:conversationId', authenticate, clearChat);

export default router;
