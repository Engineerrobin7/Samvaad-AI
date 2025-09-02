import express from 'express';
import { authController } from '../controllers/auth.controller';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - Login a user
router.post('/login', authController.login);

export default router;