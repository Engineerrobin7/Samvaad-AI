// backend/src/routes/voice.routes.ts
import express from 'express';
import multer from 'multer';
import { speechToText, textToSpeech } from '../controllers/voice.controller'; // Added textToSpeech
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({ dest: 'uploads/audio/' }); // Temporary storage for audio files

// POST /api/voice/speech-to-text - Converts audio to text
router.post('/speech-to-text', authenticate, upload.single('audio'), speechToText);

// POST /api/voice/text-to-speech - Converts text to speech
router.post('/text-to-speech', authenticate, textToSpeech); // New endpoint

export default router;