import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/auth/sync - Creates a user in our DB after they sign up with Clerk
router.post('/sync', authController.syncUser);

// GET /api/auth/profile - Gets the current user's profile
router.get('/profile', authenticate, authController.getProfile);

export default router;