// src/controllers/logs.controller.ts
import { Request, Response } from 'express';
import pool from '../db/pool';

/**
 * Get all conversation logs
 * @route GET /api/logs/conversations
 */
export const getConversationLogs = async (req: Request, res: Response) => {
  try {
    const logs = await pool.query(
      'SELECT * FROM ai_conversation_logs ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: logs.rows,
    });
  } catch (error) {
    console.error('Get conversation logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
