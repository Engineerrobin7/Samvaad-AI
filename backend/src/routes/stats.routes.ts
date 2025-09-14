// src/routes/stats.routes.ts
import express from 'express';
import { getDashboardStats } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getDashboardStats);

export default router;
