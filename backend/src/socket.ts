import { Server, Socket } from 'socket.io';
import { pool } from './db/pool';

interface ChatMessage {
  roomId: string;
  userId: number;
  message: string;
  original_language: string;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    // Join a chat room
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Handle new message
    socket.on('send_message', async (data: ChatMessage) => {
      try {
        const { roomId, userId, message, original_language } = data;

        // Persist message to PostgreSQL
        const newMessage = await pool.query(
          'INSERT INTO chat_messages (room_id, user_id, message, original_language) VALUES ($1, $2, $3, $4) RETURNING *',
          [roomId, userId, message, original_language]
        );

        // Broadcast the persisted message to the room
        io.to(roomId).emit('receive_message', newMessage.rows[0]);

      } catch (error) {
        console.error('Error handling message:', error);
        // Optionally emit an error back to the sender
        socket.emit('message_error', { message: 'Failed to send message.' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};