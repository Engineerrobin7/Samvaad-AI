import express from 'express';
import { getCulturalTips, getLanguageTips } from '../controllers/tips.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Add a root endpoint for API documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Cultural and language tips',
    available_routes: [
      { method: 'GET', path: '/cultural/:language', description: 'Get cultural tips for a specific language.' },
      { method: 'GET', path: '/language/:language', description: 'Get language learning tips.' }
    ]
  });
});

// GET /api/tips/cultural/:language - Get cultural tips for a specific language
router.get('/cultural/:language', getCulturalTips);

// GET /api/tips/language/:language - Get language learning tips
router.get('/language/:language', getLanguageTips);

export default router;