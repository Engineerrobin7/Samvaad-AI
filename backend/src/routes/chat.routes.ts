import express from 'express';
import { getChatHistory, createChatRoom } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware';
import { uploadAttachment } from '../controllers/chat.controller.js';
import multer from 'multer';
import path from 'path';

const uploadDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'application/pdf'];
    if (allowed.some(type => file.mimetype.startsWith(type))) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

const router = express.Router();

// Add a root endpoint for API documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Real-time chat functionality',
    available_routes: [
      { method: 'GET', path: '/history/:roomId', description: 'Get chat history for a room.' },
      { method: 'POST', path: '/room', description: 'Create a new chat room.' },
      { method: 'POST', path: '/', description: '(Placeholder) Receives a chat message.' },
      { method: 'POST', path: '/ai/chat', description: '(Placeholder) Processes AI chat messages.' },
      { method: 'POST', path: '/upload', description: 'Handles file and image uploads for chat attachments.' }
    ]
  });
});

// GET /api/chat/history/:roomId - Get chat history for a room
router.get('/history/:roomId', authenticate, getChatHistory);

// POST /api/chat/room - Create a new chat room
router.post('/room', authenticate, createChatRoom);

router.post('/', (req, res) => {
  // Here you would add logic to save the chat message to your database
  res.json({ message: 'Chat message received!' });
});

router.post('/ai/chat', (req, res) => {
  // Here you would add logic to process AI chat messages
  res.json({ message: 'AI chat endpoint is working!' });
});

// File/image upload endpoint
router.post('/upload', authenticate, upload.single('file'), uploadAttachment);

export default router;