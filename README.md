<p align="center">
  <img src="./public/logo.jpg" alt="Samvaad AI Logo" width="200"/>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/build-passing-brightgreen"><img src="https://img.shields.io/badge/build-passing-brightgreen"/></a>
  <a href="https://img.shields.io/badge/license-MIT-blue"><img src="https://img.shields.io/badge/license-MIT-blue"/></a>
  <a href="https://img.shields.io/badge/Next.js-14-blue"><img src="https://img.shields.io/badge/Next.js-14-blue"/></a>
  <a href="https://img.shields.io/badge/Prisma-ORM-green"><img src="https://img.shields.io/badge/Prisma-ORM-green"/></a>
</p>

# Samvaad AI

A Next.js-based AI chat and translation platform with Clerk authentication and Prisma ORM.

---

## 📋 Table of Contents
- [🚀 Features](#-features)
- [🛠️ Setup](#-setup)
- [📁 Project Structure](#-project-structure)
- [🐞 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 🚀 Features

### Core Features
- 🤖 AI-powered translation with cultural context (Gemini AI)
- 💬 Real-time multilingual chat rooms
- 📚 Comprehensive language learning system
- 🔐 Clerk authentication
- 🗄️ PostgreSQL database with Prisma ORM

### 🆕 New Advanced Features
- 🎤 **Voice Translation** - Speech-to-speech translation across languages
- 😊 **Sentiment Analysis** - Emotion detection and tone adjustment
- 📖 **Translation History** - Save, search, and favorite translations
- 🏆 **Gamification** - XP, levels, streaks, achievements, and quizzes
- 📄 **Multi-Document Chat** - Analyze and compare multiple PDFs simultaneously

![Chat Demo](https://raw.githubusercontent.com/yourusername/samvaad-ai/main/assets/demo.gif)

---

## 🛠️ Setup
### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- SQLite (default, can be changed)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/samvaad-ai.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in required values.
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Build
To build for production:
```bash
npm run build
```

---

## 📁 Project Structure
```
├── .env                  # Environment variables
├── frontend/             # Next.js app
│   ├── app/              # Application routes and pages
│   ├── prisma/           # Prisma schema and migrations
│   └── middleware.ts     # Clerk middleware
├── README.md             # Project documentation
└── .git/                 # Git version control
```

---

## 🐞 Troubleshooting
- **Clerk SignIn Error:** Ensure `/login` is a catch-all route and not protected by middleware. Check Clerk project settings and environment variables.
- **Prisma Client Error:** Run `npx prisma generate` if you see initialization errors. Ensure correct import paths for `PrismaClient`.

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

---

## 📜 License
MIT

---

<p align="center">
  <b>Contact:</b> <a href="mailto:your.email@example.com">your.email@example.com</a> | <a href="https://linkedin.com/in/yourprofile">LinkedIn</a> | <a href="https://twitter.com/yourprofile">Twitter</a>
</p>