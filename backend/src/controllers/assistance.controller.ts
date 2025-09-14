// src/controllers/assistance.controller.ts
import { Request, Response } from 'express';
import pool from '../db/pool';

/**
 * Create a new human assistance request
 * @route POST /api/assistance/request
 */
export const requestAssistance = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body;
    const userId = (req as any).user?.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Check if a request for this conversation already exists
    const existingRequest = await pool.query(
      'SELECT * FROM human_escalations WHERE conversation_id = $1',
      [conversationId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An assistance request for this conversation already exists.',
      });
    }

    // Insert a new request
    const newRequest = await pool.query(
      'INSERT INTO human_escalations (conversation_id, status) VALUES ($1, $2) RETURNING *',
      [conversationId, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Human assistance request created successfully.',
      data: newRequest.rows[0],
    });
  } catch (error) {
    console.error('Request assistance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create human assistance request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all human assistance requests
 * @route GET /api/assistance/requests
 */
export const getAssistanceRequests = async (req: Request, res: Response) => {
  try {
    const requests = await pool.query(
      'SELECT * FROM human_escalations ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: requests.rows,
    });
  } catch (error) {
    console.error('Get assistance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get human assistance requests',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
