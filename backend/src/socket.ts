import { Server, Socket } from 'socket.io';
import redisClient from './config/redis';

// Define chat message interface
interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  originalText?: string;
  language?: string;
  culturalContext?: string;
  timestamp: Date;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);
    
    // Join a chat room
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });
    
    // Leave a chat room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room: ${roomId}`);
    });
    
    // Handle new message
    socket.on('send_message', async (data: { roomId: string, message: ChatMessage }) => {
      try {
        const { roomId, message } = data;
        
        // Store message in Redis (in a real app, would also store in PostgreSQL)
        const chatHistoryKey = `chat:history:${roomId}`;
        await redisClient.lPush(chatHistoryKey, JSON.stringify(message));
        await redisClient.expire(chatHistoryKey, 86400); // Expire in 24 hours
        
        // Broadcast message to room
        io.to(roomId).emit('receive_message', message);
        
        // In a real implementation, we would:
        // 1. Translate the message if needed
        // 2. Add cultural context
        // 3. Store in database
        
        console.log(`Message sent to room ${roomId}`);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data: { roomId: string, user: string }) => {
      socket.to(data.roomId).emit('user_typing', data.user);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};