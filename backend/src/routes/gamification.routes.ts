import { Router } from 'express';
import * as gamificationController from '../controllers/gamification.controller';

const router = Router();

router.get('/progress', gamificationController.getUserProgress);
router.get('/leaderboard', gamificationController.getLeaderboard);
router.get('/achievements', gamificationController.getAllAchievements);
router.post('/quiz/generate', gamificationController.generateQuiz);
router.post('/quiz/submit', gamificationController.submitQuiz);

export default router;
