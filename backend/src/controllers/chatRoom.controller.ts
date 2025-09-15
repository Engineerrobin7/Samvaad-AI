// backend/src/controllers/chatRoom.controller.ts
import { Request, Response } from 'express';
import pool from '../db/pool';
import { v4 as uuidv4 } from 'uuid';

export const chatRoomController = {
  // Create a new chat room
  createChatRoom: async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { name, primary_language, participantIds } = req.body;
      const createdBy = (req as any).user?.id; // Assuming user ID is available from authentication middleware

      if (!name || !primary_language || !createdBy) {
        return res.status(400).json({ message: 'Missing required fields: name, primary_language, createdBy' });
      }

      const roomId = uuidv4();

      await client.query('BEGIN');

      // Insert into chat_rooms table
      await client.query(
        'INSERT INTO chat_rooms (id, name, primary_language, created_by) VALUES ($1, $2, $3, $4)',
        [roomId, name, primary_language, createdBy]
      );

      // Add creator as a participant
      await client.query(
        'INSERT INTO chat_participants (room_id, user_id) VALUES ($1, $2)',
        [roomId, createdBy]
      );

      // Add other participants if provided
      if (participantIds && Array.isArray(participantIds) && participantIds.length > 0) {
        const participantValues = participantIds.map((id: string) => `('${roomId}', ${id})`).join(',');
        await client.query(
          `INSERT INTO chat_participants (room_id, user_id) VALUES ${participantValues}`
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'Chat room created successfully', roomId, name });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating chat room:', error);
      res.status(500).json({ message: 'Failed to create chat room' });
    } finally {
      client.release();
    }
  },

  // Get all chat rooms for a user
  getChatRooms: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id; // Assuming user ID is available from authentication middleware

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await pool.query(
        `SELECT cr.id, cr.name, cr.primary_language, cr.created_at
         FROM chat_rooms cr
         JOIN chat_participants cp ON cr.id = cp.room_id
         WHERE cp.user_id = $1
         ORDER BY cr.created_at DESC`,
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ message: 'Failed to fetch chat rooms' });
    }
  },

  // Get details of a specific chat room
  getChatRoomDetails: async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const userId = (req as any).user?.id; // Assuming user ID is available from authentication middleware

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user is a participant of the room
      const participantCheck = await pool.query(
        'SELECT 1 FROM chat_participants WHERE room_id = $1 AND user_id = $2',
        [roomId, userId]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Forbidden: Not a participant of this room' });
      }

      const roomResult = await pool.query(
        'SELECT id, name, primary_language, created_by, created_at FROM chat_rooms WHERE id = $1',
        [roomId]
      );

      if (roomResult.rows.length === 0) {
        return res.status(404).json({ message: 'Chat room not found' });
      }

      const participantsResult = await pool.query(
        'SELECT u.id, u.name, u.email FROM chat_participants cp JOIN users u ON cp.user_id = u.id WHERE cp.room_id = $1',
        [roomId]
      );

      const roomDetails = {
        ...roomResult.rows[0],
        participants: participantsResult.rows,
      };

      res.json(roomDetails);
    } catch (error) {
      console.error('Error fetching chat room details:', error);
      res.status(500).json({ message: 'Failed to fetch chat room details' });
    }
  },

  // Add participants to a chat room
  addParticipants: async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { roomId } = req.params;
      const { participantIds } = req.body;
      const userId = (req as any).user?.id; // User performing the action

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: 'Participant IDs are required and must be an array' });
      }

      // Optional: Add logic to check if userId has permission to add participants (e.g., is room creator or admin)
      const roomCreatorCheck = await client.query(
        'SELECT created_by FROM chat_rooms WHERE id = $1',
        [roomId]
      );

      if (roomCreatorCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Chat room not found' });
      }

      if (roomCreatorCheck.rows[0].created_by !== userId) {
        return res.status(403).json({ message: 'Forbidden: Only the room creator can add participants' });
      }

      await client.query('BEGIN');

      const existingParticipants = (await client.query('SELECT user_id FROM chat_participants WHERE room_id = $1', [roomId])).rows.map(row => row.user_id);
      const newParticipants = participantIds.filter((id: string) => !existingParticipants.includes(parseInt(id)));

      if (newParticipants.length === 0) {
        await client.query('ROLLBACK');
        return res.status(200).json({ message: 'All provided users are already participants' });
      }

      const values = newParticipants.map((id: string) => `('${roomId}', ${id})`).join(',');
      await client.query(
        `INSERT INTO chat_participants (room_id, user_id) VALUES ${values}`
      );

      await client.query('COMMIT');
      res.json({ message: 'Participants added successfully', addedCount: newParticipants.length });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding participants:', error);
      res.status(500).json({ message: 'Failed to add participants' });
    } finally {
      client.release();
    }
  },

  // Remove a participant from a chat room
  removeParticipant: async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { roomId, userId: participantToRemoveId } = req.params;
      const userId = (req as any).user?.id; // User performing the action

      // Optional: Add logic to check if userId has permission to remove participants
      const roomCreatorCheck = await client.query(
        'SELECT created_by FROM chat_rooms WHERE id = $1',
        [roomId]
      );

      if (roomCreatorCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Chat room not found' });
      }

      if (roomCreatorCheck.rows[0].created_by !== userId) {
        return res.status(403).json({ message: 'Forbidden: Only the room creator can remove participants' });
      }

      // Prevent creator from removing themselves (unless room is being deleted)
      if (parseInt(participantToRemoveId) === roomCreatorCheck.rows[0].created_by) {
        return res.status(400).json({ message: 'Cannot remove room creator' });
      }

      const result = await client.query(
        'DELETE FROM chat_participants WHERE room_id = $1 AND user_id = $2 RETURNING * ',
        [roomId, participantToRemoveId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Participant not found in this room' });
      }

      res.json({ message: 'Participant removed successfully' });
    } catch (error) {
      console.error('Error removing participant:', error);
      res.status(500).json({ message: 'Failed to remove participant' });
    } finally {
      client.release();
    }
  },
};