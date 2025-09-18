// src/controllers/analytics.controller.ts
import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

class AnalyticsController {
  /**
   * Get conversation logs
   */
  async getConversationLogs(req: Request, res: Response) {
    try {
      const { take, skip } = req.query;
      const logs = await analyticsService.getConversationLogs(Number(take), Number(skip));
      res.json(logs);
    } catch (error) {
      console.error('Error getting conversation logs:', error);
      res.status(500).json({ error: 'Failed to retrieve conversation logs.' });
    }
  }

  /**
   * Get feedback entries
   */
  async getFeedbackEntries(req: Request, res: Response) {
    try {
      const { take, skip } = req.query;
      const feedback = await analyticsService.getFeedbackEntries(Number(take), Number(skip));
      res.json(feedback);
    } catch (error) {
      console.error('Error getting feedback entries:', error);
      res.status(500).json({ error: 'Failed to retrieve feedback entries.' });
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(req: Request, res: Response) {
    try {
      const stats = await analyticsService.getUsageStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting usage stats:', error);
      res.status(500).json({ error: 'Failed to retrieve usage statistics.' });
    }
  }
}

export const analyticsController = new AnalyticsController();
