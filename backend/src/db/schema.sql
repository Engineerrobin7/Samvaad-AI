-- src/db/schema.sql
-- Database schema for Samvaad AI (Updated without Redis dependencies)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  preferred_language VARCHAR(10) DEFAULT 'en',
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Languages table (for learning system)
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  estimated_duration INTEGER, -- in minutes
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB, -- Store lesson content as JSON
  lesson_type VARCHAR(50) DEFAULT 'text', -- text, video, quiz, exercise
  order_index INTEGER DEFAULT 0,
  estimated_duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User course progress
CREATE TABLE IF NOT EXISTS user_course_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- User lesson progress
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  score INTEGER, -- 0-100
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  primary_language VARCHAR(10) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat room participants
CREATE TABLE IF NOT EXISTS chat_participants (
  room_id VARCHAR(36) REFERENCES chat_rooms(id),
  user_id INTEGER REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(36) REFERENCES chat_rooms(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  original_language VARCHAR(10) NOT NULL,
  attachment_url VARCHAR(500),
  attachment_type VARCHAR(100),
  edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Translations (for storing translation results)
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES chat_messages(id),
  target_language VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  cultural_context TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  achievement_type VARCHAR(50) NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Language proficiency
CREATE TABLE IF NOT EXISTS language_proficiency (
  user_id INTEGER REFERENCES users(id),
  language_code VARCHAR(10) NOT NULL,
  proficiency_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, language_code)
);

-- Cultural tips (static data)
CREATE TABLE IF NOT EXISTS cultural_tips (
  id VARCHAR(50) PRIMARY KEY,
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  difficulty VARCHAR(50)
);

-- Language learning tips (static data)
CREATE TABLE IF NOT EXISTS language_tips (
  id VARCHAR(50) PRIMARY KEY,
  language_code VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  difficulty VARCHAR(50)
);

-- AI Conversation Logs
CREATE TABLE IF NOT EXISTS ai_conversation_logs (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  model VARCHAR(50),
  message TEXT NOT NULL,
  reply TEXT NOT NULL,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Human Escalations (for when AI can't handle requests)
CREATE TABLE IF NOT EXISTS human_escalations (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_translations_message_id ON translations(message_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_logs_conversation_id ON ai_conversation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_human_escalations_conversation_id ON human_escalations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_language_id ON courses(language_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);