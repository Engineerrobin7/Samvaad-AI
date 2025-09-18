// src/routes/telegram.routes.ts
import { Router } from 'express';
import { telegramController } from '../controllers/telegram.controller';

const router = Router();

router.post('/webhook', telegramController.handleUpdate);

export default router;
