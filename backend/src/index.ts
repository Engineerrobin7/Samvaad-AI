// src/index.ts
// src/index.ts
import { config } from 'dotenv'; // Load environment variables first
config();

import express, { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import pdfRoutes from './routes/pdf.routes';

// Import routes
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import tipsRoutes from './routes/tips.routes';
import aiRoutes from './routes/ai.routes';
import learnRoutes from './routes/learn.routes';
import voiceRoutes from './routes/voice.routes';
import chatRoomRoutes from './routes/chatRoom.routes';
import sentimentRoutes from './routes/sentiment.routes';
import historyRoutes from './routes/history.routes';
import gamificationRoutes from './routes/gamification.routes';
import multiDocumentRoutes from './routes/multiDocument.routes';
import collaborationRoutes from './routes/collaboration.routes';
import mlRoutes from './routes/ml.routes';
import paymentRoutes from './routes/payment.routes';
import ragRoutes from './routes/rag.routes';

// Import socket handlers
import { setupSocketHandlers } from './socket';
import { ticketService } from './services/ticket.service';

// Import DB pool
import pool from './db/pool';

// Initialize Express app
const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*', // Temporarily allow all origins for debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: '*', // Temporarily allow all origins for debugging
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/multi-document', multiDocumentRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rag', ragRoutes);

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Samvaad AI Backend!',
    version: '2.0.0',
    features: [
      'Gemini-powered AI translation with cultural context',
      'Real-time multilingual chat',
      'Comprehensive language learning system',
      'Cultural and language tips',
      'Image-to-text translation',
      'Voice-to-voice translation',
      'Sentiment analysis & tone adjustment',
      'Translation history & favorites',
      'Multi-document chat & comparison',
      'Gamified learning with achievements',
      'Real-time collaboration & annotations',
      'AI/ML-powered quality assessment',
      'Smart translation suggestions',
      'Personalized learning paths',
      'Automated error detection',
      'RAG (Retrieval-Augmented Generation) with vector embeddings',
      'Razorpay payment gateway integration'
    ],
    availableRoutes: [
      '/api/auth - Authentication endpoints',
      '/api/chat - Real-time chat functionality',
      '/api/tips - Cultural and language tips',
      '/api/ai - AI-powered translation and chat',
      '/api/learn - Language learning system',
      '/api/voice - Voice translation & speech services',
      '/api/sentiment - Sentiment analysis & tone adjustment',
      '/api/history - Translation history & favorites',
      '/api/gamification - Learning progress & achievements',
      '/api/multi-document - Multi-document chat & analysis',
      '/api/collaboration - Real-time collaboration & annotations',
      '/api/rag - RAG and document retrieval',
      '/api/payments - Razorpay payment processing',
      '/api/health - Health status check'
    ]
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Samvaad AI API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      geminiAI: !!process.env.GEMINI_API_KEY,
      llmService: !!process.env.GEMINI_API_KEY,
      ragSystem: !!process.env.OPENAI_API_KEY,
      vectorEmbeddings: !!process.env.OPENAI_API_KEY,
      database: true,
      fileUploads: true,
      socketIO: true,
      razorpayPayments: !!process.env.RAZORPAY_KEY_ID
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      '/api/auth',
      '/api/chat',
      '/api/tips',
      '/api/ai',
      '/api/learn',
      '/api/health'
    ]
  });
});

// Set up Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    server.listen(PORT, () => {
      console.log(`🚀 Samvaad AI Backend running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

      // Log feature availability
      console.log('\n📋 Feature Status:');
      console.log(`   Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Enabled' : '❌ Missing API Key'}`);
      console.log(`   Database: ✅ Connected`);
      console.log(`   File Uploads: ✅ Enabled`);
      console.log(`   Socket.IO: ✅ Enabled`);
      // Schedule ticket escalation check
      setInterval(() => {
        ticketService.checkAndEscalateTickets();
      }, 5 * 60 * 1000); // Check every 5 minutes
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();