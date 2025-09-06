import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import tipsRoutes from './routes/tips.routes';
import aiRoutes from './routes/ai.routes';
import faqRoutes from './routes/faq.routes';
import translateRoutes from './routes/translate.routes';
import { setupSocketHandlers } from './socket';
import { connectRedis } from './config/redis';

// Load environment variables
config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/translate', translateRoutes);

app.get('/api/auth', (req, res) => { res.json({ message: 'Auth route is working!' }); });
app.get('/api/chat', (req, res) => { res.json({ message: 'Chat route is working!' }); });
app.get('/api/tips', (req, res) => { res.json({ message: 'Tips route is working!' }); });
app.get('/api/ai', (req, res) => { res.json({ message: 'AI route is working!' }); });
app.get('/api/faq', (req, res) => { res.json({ message: 'FAQ route is working!' }); });
app.get('/api/translate', (req, res) => { res.json({ message: 'Translate route is working!' }); });
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Samvaad AI Backend!',
    availableRoutes: [
      '/api/auth',
      '/api/chat',
      '/api/tips',
      '/api/ai',
      '/api/faq',
      '/api/translate',
      '/api/health'
    ]
  });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Samvaad AI API is running',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/api/auth',
      '/api/chat',
      '/api/tips',
      '/api/ai',
      '/api/faq',
      '/api/translate',
      '/api/health'
    ]
  });
});

// Set up Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();