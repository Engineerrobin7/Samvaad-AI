import { Router } from 'express';
import * as sentimentController from '../controllers/sentiment.controller';

const router = Router();

router.post('/analyze', sentimentController.analyzeSentiment);
router.post('/adjust-tone', sentimentController.adjustTone);
router.post('/detect-formality', sentimentController.detectFormality);

export default router;
