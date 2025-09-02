import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';

/**
 * Get chat history for a room
 * @route GET /api/chat/history/:roomId
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    // Fetch messages from Supabase
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

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
    const userId = (req as any).user?.id || null;

    if (!name || !primaryLanguage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room name and primary language are required' 
      });
    }

    // Generate room ID
    const roomId = uuidv4();

    // Store the room in Supabase
    const { error } = await supabase
      .from('chat_rooms')
      .insert([
        {
          id: roomId,
          name,
          primary_language: primaryLanguage,
          created_by: userId,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      data: {
        roomId,
        name,
        primaryLanguage,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error creating chat room' 
    });
  }
};