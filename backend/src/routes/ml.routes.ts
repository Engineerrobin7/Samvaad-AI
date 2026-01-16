import { Router } from 'express';
import * as mlController from '../controllers/ml.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Translation Quality Assessment
router.post('/assess-quality', mlController.assessTranslationQuality);

// Smart Translation Suggestions
router.post('/smart-suggestions', mlController.getSmartSuggestions);

// Predict Best Translation
router.post('/predict-best', mlController.predictBestTranslation);

// User Pattern Analysis
router.get('/analyze-patterns', mlController.analyzeUserPatterns);

// Language Proficiency Assessment
router.get('/proficiency/:language', mlController.assessProficiency);

// Generate Personalized Learning Path
router.post('/learning-path', mlController.generateLearningPath);

// Error Detection and Correction
router.post('/detect-errors', mlController.detectErrors);

// Predict Learning Needs
router.get('/predict-needs', mlController.predictLearningNeeds);

// Sentiment-based Translation Adjustment
router.post('/adjust-sentiment', mlController.adjustBySentiment);

export default router;
