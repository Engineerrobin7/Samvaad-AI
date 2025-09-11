import express from 'express';
import { learnController } from '../controllers/learn.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/languages', authenticate, learnController.getLanguages);
router.get('/details/:languageCode', authenticate, learnController.getLanguageDetails);

export default router;