// backend/src/routes/voice.routes.ts
import express from 'express';
import multer from 'multer';
import { speechToText } from '../controllers/voice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({ dest: 'uploads/audio/' }); // Temporary storage for audio files

// POST /api/voice/speech-to-text - Converts audio to text
router.post('/speech-to-text', authenticate, upload.single('audio'), speechToText);

export default router;