import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool';

/**
 * Get chat history for a room
 * @route GET /api/chat/history/:roomId
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const { rows: messages } = await pool.query(
      'SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at ASC',
      [roomId]
    );

    return res.status(200).json({
      success: true,
      data: {
        roomId,
        messages
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting chat history' 
    });
  }
};

/**
 * Create a new chat room
 * @route POST /api/chat/room
 */
export const createChatRoom = async (req: Request, res: Response) => {
  try {
    const { name, participants, primaryLanguage } = req.body;
    const userId = (req as any).user?.id;

    if (!name || !primaryLanguage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room name and primary language are required' 
      });
    }

    const roomId = uuidv4();

    await pool.query('BEGIN');

    const newRoom = await pool.query(
      'INSERT INTO chat_rooms (id, name, primary_language, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [roomId, name, primaryLanguage, userId]
    );

    if (participants && participants.length > 0) {
      const participantValues = participants.map((p: any) => `('${roomId}', ${p.id})`).join(',');
      await pool.query(`INSERT INTO chat_participants (room_id, user_id) VALUES ${participantValues}`);
    }

    // Add the creator as a participant
    await pool.query('INSERT INTO chat_participants (room_id, user_id) VALUES ($1, $2)', [roomId, userId]);

    await pool.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: newRoom.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Create chat room error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error creating chat room' 
    });
  }
};