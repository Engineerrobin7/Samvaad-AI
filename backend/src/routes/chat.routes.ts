import express from 'express';
import { getChatHistory, createChatRoom } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/chat/history/:roomId - Get chat history for a room
router.get('/history/:roomId', authenticate, getChatHistory);

// POST /api/chat/room - Create a new chat room
router.post('/room', authenticate, createChatRoom);

router.post('/', (req, res) => {
  // Here you would add logic to save the chat message to your database
  res.json({ message: 'Chat message received!' });
});

export default router;