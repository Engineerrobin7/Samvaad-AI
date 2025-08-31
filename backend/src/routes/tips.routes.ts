import express from 'express';
import { getCulturalTips, getLanguageTips } from '../controllers/tips.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/tips/cultural/:language - Get cultural tips for a specific language
router.get('/cultural/:language', getCulturalTips);

// GET /api/tips/language/:language - Get language learning tips
router.get('/language/:language', getLanguageTips);

export default router;