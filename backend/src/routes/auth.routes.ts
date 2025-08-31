import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login a user
router.post('/login', login);

// GET /api/auth/profile - Get user profile (protected route)
router.get('/profile', authenticate, getProfile);

export default router;