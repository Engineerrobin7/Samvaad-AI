// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import pdfRoutes from './routes/pdf.routes';

// Import routes
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import tipsRoutes from './routes/tips.routes';
import aiRoutes from './routes/ai.routes';
import learnRoutes from './routes/learn.routes';

// Import socket handlers
import { setupSocketHandlers } from './socket';

// Import DB pool
import pool from './db/pool';

// Load environment variables
config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
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
      'Image-to-text translation'
    ],
    availableRoutes: [
      '/api/auth - Authentication endpoints',
      '/api/chat - Real-time chat functionality',
      '/api/tips - Cultural and language tips',
      '/api/ai - AI-powered translation and chat',
       
      '/api/learn - Language learning system',
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
      database: true,
      fileUploads: true,
      socketIO: true
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
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
