import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import  pool  from '../db/pool';
import multer from 'multer';
import path from 'path';

/**
 * Get chat history for a room
 * @route GET /api/chat/history/:roomId
 */
// Pagination for chat history
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const { rows: messages } = await pool.query(
      'SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
      [roomId, limit, offset]
    );
    const totalResult = await pool.query(
      'SELECT COUNT(*) FROM chat_messages WHERE room_id = $1',
      [roomId]
    );
    return res.status(200).json({
      success: true,
      data: {
        roomId,
        messages,
        total: parseInt(totalResult.rows[0].count),
        page,
        limit
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

// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  try {
    await pool.query('DELETE FROM chat_messages WHERE id = $1', [messageId]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

// Edit a message
export const editMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { content } = req.body;
  try {
    await pool.query('UPDATE chat_messages SET content = $1, edited = true WHERE id = $2', [content, messageId]);
    res.json({ success: true, message: 'Message edited' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to edit message' });
  }
};

// Search messages
export const searchMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { query } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE room_id = $1 AND content ILIKE $2 ORDER BY created_at ASC',
      [roomId, `%${query}%`]
    );
    res.json({ success: true, messages: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search messages' });
  }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response) => {
  const { roomId, userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM chat_messages WHERE room_id = $1 AND created_at > (SELECT last_read FROM chat_room_users WHERE room_id = $1 AND user_id = $2)',
      [roomId, userId]
    );
    res.json({ success: true, unread: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
};

// Typing indicator (placeholder)
export const setTyping = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Typing indicator set (placeholder)' });
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
export const upload = multer({ storage });

// Upload file/image and create chat message with attachment
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const { roomId, userId } = req.body;
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Save file metadata and create chat message
    const messageId = uuidv4();
    const fileUrl = `/uploads/${file.filename}`;
    await pool.query(
      'INSERT INTO chat_messages (id, room_id, user_id, content, attachment_url, attachment_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [messageId, roomId, userId, '', fileUrl, file.mimetype]
    );
    res.status(201).json({ success: true, message: 'File uploaded', fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
};