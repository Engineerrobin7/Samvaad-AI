import { Request, Response } from 'express';
import { gamificationService } from '../services/gamification.service';

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const progress = await gamificationService.getUserProgress(userId);

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user progress',
    });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await gamificationService.getLeaderboard(limit);

    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard',
    });
  }
};

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { language, difficulty = 'beginner' } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required',
      });
    }

    const quiz = await gamificationService.generateQuiz(language, difficulty);

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
    });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and answers are required',
      });
    }

    const result = await gamificationService.submitQuiz(userId, quizId, answers);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
    });
  }
};

export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const achievements = gamificationService.getAllAchievements();

    return res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve achievements',
    });
  }
};
