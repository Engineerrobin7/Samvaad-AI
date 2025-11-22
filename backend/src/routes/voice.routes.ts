import { Router } from 'express';
import * as voiceController from '../controllers/voice.controller';

const router = Router();

router.post('/speech-to-text', voiceController.uploadMiddleware, voiceController.speechToText);
router.post('/text-to-speech', voiceController.textToSpeech);
router.post('/translate', voiceController.uploadMiddleware, voiceController.translateVoice);

export default router;
