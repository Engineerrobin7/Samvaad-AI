// src/controllers/stats.controller.ts
import { Request, Response } from 'express';
import pool from '../db/pool';

/**
 * Get dashboard statistics
 * @route GET /api/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const totalConversations = await pool.query('SELECT COUNT(*) FROM ai_conversation_logs');
    const pendingAssistanceRequests = await pool.query("SELECT COUNT(*) FROM human_escalations WHERE status = 'pending'");

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalConversations: parseInt(totalConversations.rows[0].count),
        pendingAssistanceRequests: parseInt(pendingAssistanceRequests.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};