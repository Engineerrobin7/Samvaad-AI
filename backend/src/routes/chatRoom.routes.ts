// backend/src/routes/chatRoom.routes.ts
import express from 'express';
import { chatRoomController } from '../controllers/chatRoom.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/chat/rooms - Create a new chat room
router.post('/rooms', authenticate, chatRoomController.createChatRoom);

// GET /api/chat/rooms - Get all chat rooms for the authenticated user
router.get('/rooms', authenticate, chatRoomController.getChatRooms);

// GET /api/chat/rooms/:roomId - Get details of a specific chat room
router.get('/rooms/:roomId', authenticate, chatRoomController.getChatRoomDetails);

// POST /api/chat/rooms/:roomId/participants - Add participants to a chat room
router.post('/rooms/:roomId/participants', authenticate, chatRoomController.addParticipants);

// DELETE /api/chat/rooms/:roomId/participants/:userId - Remove a participant from a chat room
router.delete('/rooms/:roomId/participants/:userId', authenticate, chatRoomController.removeParticipant);

export default router;