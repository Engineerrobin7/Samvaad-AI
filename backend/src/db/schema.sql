-- Database schema for Samvaad AI

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
  message TEXT NOT NULL,
  original_language VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Translations
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

-- Cultural tips learned
CREATE TABLE IF NOT EXISTS cultural_tips_learned (
  user_id INTEGER REFERENCES users(id),
  tip_id VARCHAR(50) NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tip_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_translations_message_id ON translations(message_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_cultural_tips_learned_user_id ON cultural_tips_learned(user_id);