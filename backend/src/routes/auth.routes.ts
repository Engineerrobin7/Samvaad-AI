import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Add a root endpoint for API documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Authentication endpoints',
    available_routes: [
      { method: 'POST', path: '/sync', description: 'Creates a user in our DB after they sign up with Clerk.' },
      { method: 'GET', path: '/profile', description: 'Gets the current user\'s profile.' }
    ]
  });
});

// POST /api/auth/sync - Creates a user in our DB after they sign up with Clerk
router.post('/sync', authController.syncUser);

// GET /api/auth/profile - Gets the current user's profile
router.get('/profile', authenticate, authController.getProfile);

export default router;