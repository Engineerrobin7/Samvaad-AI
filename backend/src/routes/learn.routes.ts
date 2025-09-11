import express from 'express';
import { learnController } from '../controllers/learn.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Add a root endpoint for API documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Language learning system',
    available_routes: [
      { method: 'GET', path: '/languages', description: 'Retrieves a list of available languages for learning.' },
      { method: 'GET', path: '/details/:languageCode', description: 'Gets detailed information about a specific language course.' }
    ]
  });
});

router.get('/languages', authenticate, learnController.getLanguages);
router.get('/details/:languageCode', authenticate, learnController.getLanguageDetails);

export default router;