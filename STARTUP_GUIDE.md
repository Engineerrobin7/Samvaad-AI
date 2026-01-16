# 🚀 Samvaad AI - Startup Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Environment variables configured

---

## Step 1: Setup Environment Variables

### Backend (.env)
Create `backend/.env` with:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/samvaad_ai

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication (Clerk)
CLERK_SECRET_KEY=your_clerk_secret_key

# Payment (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
Create `frontend/.env.local` with:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Step 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 3: Setup Database

```bash
cd backend
npm run db:setup
```

This will create all necessary tables in your PostgreSQL database.

---

## Step 4: Start the Servers

### Option A: Run Both Together (Recommended)
From the root directory:
```bash
npm run dev
```

### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Step 5: Access the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## 🎯 Available Features

### 1. Dashboard
**URL**: http://localhost:3000/dashboard
- Overview of all features
- Quick stats and recent activity

### 2. Translation
**URL**: http://localhost:3000/translate
- Basic text translation
- Multi-language support

### 3. AI Assistant
**URL**: http://localhost:3000/ai-assistant
- Quality assessment
- Smart suggestions
- Proficiency testing
- Learning paths
- Error detection

### 4. Collaboration
**URL**: http://localhost:3000/collaboration
- Real-time workspace
- Voting system
- Comments and annotations

### 5. RAG Chat
**URL**: http://localhost:3000/rag-chat
- Upload documents
- Chat with PDFs
- Semantic search

### 6. Gamification
**URL**: http://localhost:3000/gamification
- XP and levels
- Achievements
- Leaderboard
- Quizzes

### 7. Analytics
**URL**: http://localhost:3000/analytics
- Progress tracking
- Activity charts
- Performance metrics

### 8. Voice Translation
**URL**: http://localhost:3000/voice-translate
- Speech-to-speech translation
- Multiple voices

### 9. Sentiment Analyzer
**URL**: http://localhost:3000/sentiment-analyzer
- Emotion detection
- Tone adjustment

### 10. Chat Rooms
**URL**: http://localhost:3000/chat
- Multilingual chat
- Real-time messaging

### 11. PDF Chat
**URL**: http://localhost:3000/chat-with-pdf
- Upload PDFs
- Ask questions

### 12. Learning
**URL**: http://localhost:3000/learn
- Structured courses
- Interactive lessons

### 13. Pricing
**URL**: http://localhost:3000/payment
- View plans
- Subscribe

---

## 🔧 Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Ensure GEMINI_API_KEY is set
4. Check port 5000 is not in use

### Frontend won't start
1. Check if backend is running
2. Verify Clerk keys in .env.local
3. Check port 3000 is not in use
4. Clear .next folder: `rm -rf .next`

### Database errors
1. Run migrations: `npm run db:setup`
2. Check PostgreSQL connection
3. Verify database exists

### API errors
1. Check backend logs
2. Verify API_URL in frontend .env.local
3. Check CORS settings

---

## 📝 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 🏗️ Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

---

## 🎨 Development Tips

### Hot Reload
Both frontend and backend support hot reload during development.

### API Documentation
Visit http://localhost:5000/ for API documentation

### Database GUI
Use tools like pgAdmin or DBeaver to view database

### Debugging
- Backend: Use VS Code debugger or console.log
- Frontend: Use React DevTools and browser console

---

## 📊 Project Structure

```
samvaad-ai/
├── backend/
│   ├── src/
│   │   ├── services/      # Business logic
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation
│   │   ├── db/            # Database
│   │   └── __tests__/     # Tests
│   ├── dist/              # Compiled JS
│   └── package.json
│
├── frontend/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── providers/         # Context providers
│   └── package.json
│
└── package.json           # Root package
```

---

## 🔑 Important Notes

1. **Never commit .env files** - They contain sensitive keys
2. **Use strong passwords** - For database and services
3. **Keep dependencies updated** - Run `npm update` regularly
4. **Backup database** - Before major changes
5. **Test before deploying** - Run all tests

---

## 🆘 Getting Help

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database connection failed:**
- Check PostgreSQL is running
- Verify credentials in .env
- Test connection: `psql -U username -d samvaad_ai`

---

## 🎉 Success!

If everything is working, you should see:

**Backend Console:**
```
✅ Database connection successful
🚀 Samvaad AI Backend running on port 5000
🌐 Health check: http://localhost:5000/api/health
```

**Frontend Console:**
```
✓ Ready in 3.2s
○ Local: http://localhost:3000
```

**Browser:**
- Navigate to http://localhost:3000
- You should see the landing page
- Click "Dashboard" to explore features

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review error logs
3. Check documentation files:
   - COMPLETE_IMPLEMENTATION.md
   - AI_ML_IMPLEMENTATION.md
   - TEST_RESULTS.md

---

**Happy Coding! 🚀**
