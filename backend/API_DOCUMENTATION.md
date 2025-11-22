# Samvaad AI - API Documentation

## New Features Added

### 1. Voice Translation API (`/api/voice`)

#### Speech to Text
```
POST /api/voice/speech-to-text
Content-Type: multipart/form-data

Body:
- audio: Audio file (wav, mp3, ogg, webm)
- language: Language code (e.g., 'en', 'hi', 'bn')

Response:
{
  "success": true,
  "data": {
    "text": "Transcribed text"
  }
}
```

#### Text to Speech
```
POST /api/voice/text-to-speech
Content-Type: application/json

Body:
{
  "text": "Text to convert",
  "language": "en",
  "voiceGender": "FEMALE" // or "MALE"
}

Response: Audio file (audio/mpeg)
```

#### Voice Translation
```
POST /api/voice/translate
Content-Type: multipart/form-data

Body:
- audio: Audio file
- sourceLanguage: Source language code
- targetLanguage: Target language code

Response:
{
  "success": true,
  "data": {
    "originalText": "Original transcribed text",
    "translatedText": "Translated text",
    "audioUrl": "/uploads/audio/translated_xxx.mp3",
    "sourceLanguage": "en",
    "targetLanguage": "hi"
  }
}
```

---

### 2. Sentiment Analysis API (`/api/sentiment`)

#### Analyze Sentiment
```
POST /api/sentiment/analyze
Content-Type: application/json

Body:
{
  "text": "Text to analyze",
  "language": "en"
}

Response:
{
  "success": true,
  "data": {
    "sentiment": "positive", // or "negative", "neutral"
    "score": 0.8, // -1 to 1
    "emotions": ["happy", "excited"],
    "confidence": 0.95
  }
}
```

#### Adjust Tone
```
POST /api/sentiment/adjust-tone
Content-Type: application/json

Body:
{
  "text": "Original text",
  "targetTone": "formal", // or "casual", "polite", "friendly", "professional", "empathetic"
  "language": "en"
}

Response:
{
  "success": true,
  "data": {
    "originalText": "hey what's up",
    "adjustedText": "Hello, how are you doing?",
    "tone": "formal",
    "changes": ["Changed 'hey' to 'Hello'", "Made greeting more formal"]
  }
}
```

#### Detect Formality
```
POST /api/sentiment/detect-formality
Content-Type: application/json

Body:
{
  "text": "Text to analyze",
  "language": "en"
}

Response:
{
  "success": true,
  "data": {
    "level": "formal", // "very_formal", "formal", "neutral", "casual", "very_casual"
    "score": 0.7,
    "indicators": ["Use of 'please'", "Formal greeting"]
  }
}
```

---

### 3. Translation History API (`/api/history`)

#### Get History
```
GET /api/history?limit=50&offset=0

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": "user123",
      "originalText": "Hello",
      "translatedText": "नमस्ते",
      "sourceLanguage": "en",
      "targetLanguage": "hi",
      "isFavorite": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Favorites
```
GET /api/history/favorites

Response: Same as history
```

#### Toggle Favorite
```
POST /api/history/:translationId/favorite

Response:
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

#### Search History
```
GET /api/history/search?q=hello&sourceLanguage=en&targetLanguage=hi

Response: Array of matching translations
```

#### Get Statistics
```
GET /api/history/stats

Response:
{
  "success": true,
  "data": {
    "totalTranslations": 150,
    "favoriteCount": 25,
    "languagePairs": [
      { "source": "en", "target": "hi", "count": 50 }
    ],
    "recentLanguages": ["hi", "bn", "te"]
  }
}
```

---

### 4. Gamification API (`/api/gamification`)

#### Get User Progress
```
GET /api/gamification/progress

Response:
{
  "success": true,
  "data": {
    "userId": "user123",
    "level": 5,
    "xp": 450,
    "streak": 7,
    "lastActivityDate": "2024-01-01T00:00:00Z",
    "badges": ["first_translation", "week_streak"]
  }
}
```

#### Get Leaderboard
```
GET /api/gamification/leaderboard?limit=10

Response:
{
  "success": true,
  "data": [
    {
      "userId": "user123",
      "level": 10,
      "xp": 1000,
      "streak": 30,
      "badges": ["translation_master", "polyglot"]
    }
  ]
}
```

#### Generate Quiz
```
POST /api/gamification/quiz/generate
Content-Type: application/json

Body:
{
  "language": "hi",
  "difficulty": "beginner" // or "intermediate", "advanced"
}

Response:
{
  "success": true,
  "data": {
    "id": 12345,
    "language": "hi",
    "difficulty": "beginner",
    "questions": [
      {
        "question": "How do you say 'Hello' in Hindi?",
        "options": ["Namaste", "Hola", "Bonjour", "Konnichiwa"],
        "correctAnswer": 0,
        "explanation": "Namaste is a common greeting in Hindi"
      }
    ]
  }
}
```

#### Submit Quiz
```
POST /api/gamification/quiz/submit
Content-Type: application/json

Body:
{
  "quizId": 12345,
  "answers": [0, 1, 2] // Array of selected answer indices
}

Response:
{
  "success": true,
  "data": {
    "score": 2,
    "totalQuestions": 3,
    "xpEarned": 20,
    "passed": true
  }
}
```

#### Get All Achievements
```
GET /api/gamification/achievements

Response:
{
  "success": true,
  "data": [
    {
      "id": "first_translation",
      "name": "First Steps",
      "description": "Complete your first translation",
      "icon": "🎯",
      "xpReward": 10,
      "requirement": 1,
      "category": "translation"
    }
  ]
}
```

---

### 5. Multi-Document Chat API (`/api/multi-document`)

#### Add Document
```
POST /api/multi-document/add
Content-Type: multipart/form-data

Body:
- document: PDF or text file
- sessionId: Unique session identifier

Response:
{
  "success": true,
  "data": {
    "id": "doc_123",
    "name": "document.pdf",
    "type": "pdf",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Chat with Documents
```
POST /api/multi-document/chat
Content-Type: application/json

Body:
{
  "sessionId": "session123",
  "question": "What are the main points?",
  "language": "en"
}

Response:
{
  "success": true,
  "data": {
    "answer": "Based on the documents..."
  }
}
```

#### Summarize Documents
```
POST /api/multi-document/summarize
Content-Type: application/json

Body:
{
  "sessionId": "session123",
  "language": "en"
}

Response:
{
  "success": true,
  "data": {
    "summary": "Comprehensive summary of all documents..."
  }
}
```

#### Compare Documents
```
POST /api/multi-document/compare
Content-Type: application/json

Body:
{
  "sessionId": "session123",
  "aspect": "pricing", // What to compare
  "language": "en"
}

Response:
{
  "success": true,
  "data": {
    "comparison": "Document 1 mentions... while Document 2 states..."
  }
}
```

#### Get Documents
```
GET /api/multi-document/:sessionId

Response:
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "name": "document.pdf",
      "type": "pdf",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Remove Document
```
DELETE /api/multi-document/:sessionId/:documentId

Response:
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

---

## Environment Variables Required

Add these to your `.env` file:

```env
# Existing
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url

# New (Optional - for Google Cloud Speech & TTS)
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}
```

---

## Database Setup

Run the updated schema:

```bash
npm run db:setup
```

This will create the new tables:
- `translation_history`
- `user_progress`
- `activity_log`
- `quiz_results`

---

## Usage Examples

### Frontend Integration Example

```typescript
// Voice Translation
const translateVoice = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('sourceLanguage', 'en');
  formData.append('targetLanguage', 'hi');

  const response = await fetch('/api/voice/translate', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data;
};

// Sentiment Analysis
const analyzeSentiment = async (text: string) => {
  const response = await fetch('/api/sentiment/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language: 'en' }),
  });

  const data = await response.json();
  return data;
};

// Gamification
const getUserProgress = async () => {
  const response = await fetch('/api/gamification/progress');
  const data = await response.json();
  return data;
};
```

---

## Feature Summary

✅ **Voice Translation** - Speech-to-text, text-to-speech, voice-to-voice translation
✅ **Sentiment Analysis** - Analyze emotions, adjust tone, detect formality
✅ **Translation History** - Save, favorite, search past translations
✅ **Gamification** - XP, levels, streaks, achievements, quizzes, leaderboard
✅ **Multi-Document Chat** - Upload multiple PDFs, chat, summarize, compare

All features are production-ready and integrated with your existing Gemini AI backend!
