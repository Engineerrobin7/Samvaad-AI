// src/routes/widget.routes.ts
import { Router } from 'express';
import { widgetController } from '../controllers/widget.controller';

const router = Router();

router.post('/chat', widgetController.chat);

export default router;
