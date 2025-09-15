import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import chatRouter from './routes/chat.routes';
import translateRouter from './routes/translate.routes';
import tipsRouter from './routes/tips.routes';
import aiRouter from './routes/ai.routes';
import assistanceRouter from './routes/assistance.routes';

import fileUpload from 'express-fileupload';
const server = express();

// Middleware
server.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
server.use(express.json());

// Routes
server.use('/api/auth', authRouter);
server.use('/api/chat', chatRouter);
server.use('/api/translate', translateRouter);
server.use('/api/tips', tipsRouter);
server.use('/api/ai', aiRouter);
server.use('/api/assistance', assistanceRouter);

export default server;