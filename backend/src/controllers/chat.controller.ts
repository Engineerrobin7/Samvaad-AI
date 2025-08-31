import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';
import redisClient from '../config/redis';

/**
 * Get chat history for a room
 * @route GET /api/chat/history/:roomId
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;
    
    // Check if user has access to this room
    // In a real implementation, we would check the database
    
    // Get chat history from Redis
    const chatHistoryKey = `chat:history:${roomId}`;
    const chatHistory = await redisClient.lRange(chatHistoryKey, 0, -1);
    
    // Parse messages
    const messages = chatHistory.map(message => JSON.parse(message));
    
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
    const userId = (req as any).user.id;
    
    // Validate input
    if (!name || !primaryLanguage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room name and primary language are required' 
      });
    }
    
    // Generate room ID
    const roomId = uuidv4();
    
    // In a real implementation, we would store the room in the database
    // For now, we'll just return the room ID
    
    // Store room info in Redis for demo purposes
    const roomKey = `chat:room:${roomId}`;
    await redisClient.hSet(roomKey, {
      id: roomId,
      name,
      primaryLanguage,
      createdBy: userId,
      createdAt: new Date().toISOString()
    });
    
    // Set expiration for demo
    await redisClient.expire(roomKey, 86400); // 24 hours
    
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