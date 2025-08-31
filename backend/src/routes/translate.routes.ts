import express from 'express';
import { translateText, detectLanguage } from '../controllers/translate.controller';

const router = express.Router();

// POST /api/translate - Translate text with cultural context
router.post('/', translateText);

// POST /api/translate/detect - Detect language of text
router.post('/detect', detectLanguage);

export default router;