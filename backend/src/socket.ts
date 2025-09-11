// src/socket.ts
import { Server, Socket } from 'socket.io';
import  pool  from './db/pool';

// In-memory store for active connections and typing indicators
const activeConnections = new Map<string, string[]>(); // roomId -> socketIds[]
const typingUsers = new Map<string, Set<string>>(); // roomId -> Set<userId>

// Define chat message interface
interface ChatMessage {
  id: string;
  roomId: string;
  userId: number;
  content: string;
  originalLanguage?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  timestamp: Date;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);
    
    // Join a chat room
    socket.on('join_room', async (data: { roomId: string, userId: number }) => {
      try {
        const { roomId, userId } = data;
        
        // Verify user has access to this room
        const { rows } = await pool.query(
          'SELECT * FROM chat_participants WHERE room_id = $1 AND user_id = $2',
          [roomId, userId]
        );
        
        if (rows.length === 0) {
          socket.emit('error', { message: 'Unauthorized access to chat room' });
          return;
        }
        
        socket.join(roomId);
        
        // Track active connections
        if (!activeConnections.has(roomId)) {
          activeConnections.set(roomId, []);
        }
        activeConnections.get(roomId)?.push(socket.id);
        
        console.log(`User ${userId} joined room: ${roomId}`);
        
        // Notify other users in the room
        socket.to(roomId).emit('user_joined', { userId, socketId: socket.id });
        
        // Send recent chat history (last 20 messages)
        const { rows: messages } = await pool.query(`
          SELECT 
            cm.*,
            u.name as sender_name
          FROM chat_messages cm
          JOIN users u ON cm.user_id = u.id
          WHERE cm.room_id = $1
          ORDER BY cm.created_at DESC
          LIMIT 20
        `, [roomId]);
        
        socket.emit('chat_history', messages.reverse());
        
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });
    
    // Leave a chat room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      
      // Remove from active connections
      const connections = activeConnections.get(roomId);
      if (connections) {
        const index = connections.indexOf(socket.id);
        if (index > -1) {
          connections.splice(index, 1);
        }
        if (connections.length === 0) {
          activeConnections.delete(roomId);
          typingUsers.delete(roomId);
        }
      }
      
      console.log(`User ${socket.id} left room: ${roomId}`);
      socket.to(roomId).emit('user_left', { socketId: socket.id });
    });
    
    // Handle new message
    socket.on('send_message', async (data: ChatMessage) => {
      try {
        const { roomId, userId, content, originalLanguage, attachmentUrl, attachmentType } = data;
        
        // Verify user has access to this room
        const { rows } = await pool.query(
          'SELECT * FROM chat_participants WHERE room_id = $1 AND user_id = $2',
          [roomId, userId]
        );
        
        if (rows.length === 0) {
          socket.emit('error', { message: 'Unauthorized access to chat room' });
          return;
        }
        
        // Save message to database
        const { rows: savedMessage } = await pool.query(`
          INSERT INTO chat_messages 
          (room_id, user_id, content, original_language, attachment_url, attachment_type, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING *
        `, [roomId, userId, content, originalLanguage || 'en', attachmentUrl, attachmentType]);
        
        // Get sender info
        const { rows: senderInfo } = await pool.query(
          'SELECT name FROM users WHERE id = $1',
          [userId]
        );
        
        const messageWithSender = {
          ...savedMessage[0],
          sender_name: senderInfo[0]?.name || 'Unknown User'
        };
        
        // Broadcast message to room
        io.to(roomId).emit('receive_message', messageWithSender);
        
        // Clear typing indicator for this user
        const typingSet = typingUsers.get(roomId);
        if (typingSet) {
          typingSet.delete(userId.toString());
          io.to(roomId).emit('typing_update', Array.from(typingSet));
        }
        
        console.log(`Message sent to room ${roomId} by user ${userId}`);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing_start', (data: { roomId: string, userId: number, userName: string }) => {
      const { roomId, userId, userName } = data;
      
      if (!typingUsers.has(roomId)) {
        typingUsers.set(roomId, new Set());
      }
      
      typingUsers.get(roomId)?.add(userId.toString());
      
      // Broadcast to other users in the room (not the sender)
      socket.to(roomId).emit('user_typing_start', { userId, userName });
    });
    
    socket.on('typing_stop', (data: { roomId: string, userId: number }) => {
      const { roomId, userId } = data;
      
      const typingSet = typingUsers.get(roomId);
      if (typingSet) {
        typingSet.delete(userId.toString());
        
        // Broadcast to other users in the room
        socket.to(roomId).emit('user_typing_stop', { userId });
      }
    });
    
    // Handle message reactions (future feature)
    socket.on('add_reaction', async (data: { messageId: number, reaction: string, userId: number }) => {
      // This would be implemented when adding message reactions feature
      // For now, just acknowledge
      socket.emit('reaction_added', data);
    });
    
    // Handle message editing
    socket.on('edit_message', async (data: { messageId: number, newContent: string, userId: number }) => {
      try {
        const { messageId, newContent, userId } = data;
        
        // Verify the user owns this message
        const { rows } = await pool.query(
          'SELECT room_id FROM chat_messages WHERE id = $1 AND user_id = $2',
          [messageId, userId]
        );
        
        if (rows.length === 0) {
          socket.emit('error', { message: 'Cannot edit this message' });
          return;
        }
        
        const roomId = rows[0].room_id;
        
        // Update message
        await pool.query(
          'UPDATE chat_messages SET content = $1, edited = true WHERE id = $2',
          [newContent, messageId]
        );
        
        // Broadcast the edit to the room
        io.to(roomId).emit('message_edited', {
          messageId,
          newContent,
          userId
        });
        
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });
    
    // Handle message deletion
    socket.on('delete_message', async (data: { messageId: number, userId: number }) => {
      try {
        const { messageId, userId } = data;
        
        // Verify the user owns this message
        const { rows } = await pool.query(
          'SELECT room_id FROM chat_messages WHERE id = $1 AND user_id = $2',
          [messageId, userId]
        );
        
        if (rows.length === 0) {
          socket.emit('error', { message: 'Cannot delete this message' });
          return;
        }
        
        const roomId = rows[0].room_id;
        
        // Delete message (or mark as deleted)
        await pool.query('DELETE FROM chat_messages WHERE id = $1', [messageId]);
        
        // Broadcast the deletion to the room
        io.to(roomId).emit('message_deleted', {
          messageId,
          userId
        });
        
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up active connections and typing indicators
      for (const [roomId, connections] of activeConnections.entries()) {
        const index = connections.indexOf(socket.id);
        if (index > -1) {
          connections.splice(index, 1);
          
          // Notify room that user left
          socket.to(roomId).emit('user_left', { socketId: socket.id });
          
          if (connections.length === 0) {
            activeConnections.delete(roomId);
            typingUsers.delete(roomId);
          }
        }
      }
    });
    
    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  // Periodic cleanup of inactive connections (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, connections] of activeConnections.entries()) {
      if (connections.length === 0) {
        activeConnections.delete(roomId);
        typingUsers.delete(roomId);
      }
    }
  }, 5 * 60 * 1000);
};