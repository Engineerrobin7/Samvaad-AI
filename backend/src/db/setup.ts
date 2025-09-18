// src/db/setup.ts
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Read schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema SQL
    await pool.query(schemaSql);
    console.log('Database schema created successfully');

    // Insert demo data for hackathon presentation
    await insertDemoData(pool);
    console.log('Demo data inserted successfully');

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

async function insertDemoData(pool: Pool) {
  // Insert demo users
  await pool.query(`
    INSERT INTO users (name, email, password, preferred_language, points, level)
    VALUES 
      ('Demo User', 'demo@samvaad.ai', '$2b$10$1JqT7PrIYYS2SX8.H1zOi.GBkxnGGJLKFnWlQWW0.U0U8UXHq1Bwu', 'en', 150, 3),
      ('Hindi Speaker', 'hindi@samvaad.ai', '$2b$10$1JqT7PrIYYS2SX8.H1zOi.GBkxnGGJLKFnWlQWW0.U0U8UXHq1Bwu', 'hi', 75, 2),
      ('Bengali Speaker', 'bengali@samvaad.ai', '$2b$10$1JqT7PrIYYS2SX8.H1zOi.GBkxnGGJLKFnWlQWW0.U0U8UXHq1Bwu', 'bn', 100, 2)
    ON CONFLICT (email) DO NOTHING;
  `);

  // Insert languages
  await pool.query(`
    INSERT INTO languages (code, name, native_name, difficulty_level, description, is_active)
    VALUES 
      ('hi', 'Hindi', 'हिन्दी', 'beginner', 'The most widely spoken language in India, official language of the country.', true),
      ('bn', 'Bengali', 'বাংলা', 'intermediate', 'Spoken in West Bengal and Bangladesh, rich literary tradition.', true),
      ('te', 'Telugu', 'తెలుగు', 'intermediate', 'Classical language of South India, spoken in Andhra Pradesh and Telangana.', true),
      ('ta', 'Tamil', 'தமிழ்', 'advanced', 'Ancient Dravidian language with rich literature, spoken in Tamil Nadu.', true),
      ('gu', 'Gujarati', 'ગુજરાતી', 'beginner', 'Language of Gujarat state, known for its business community.', true),
      ('mr', 'Marathi', 'मराठी', 'intermediate', 'Language of Maharashtra, rich cultural heritage.', true)
    ON CONFLICT (code) DO NOTHING;
  `);

  // Insert sample courses
  await pool.query(`
    INSERT INTO courses (language_id, title, description, difficulty_level, estimated_duration, order_index, is_active)
    VALUES 
      (1, 'Hindi Basics', 'Learn fundamental Hindi words and phrases for everyday communication.', 'beginner', 480, 1, true),
      (1, 'Hindi Grammar', 'Understand Hindi sentence structure and grammatical rules.', 'intermediate', 720, 2, true),
      (1, 'Hindi Culture', 'Explore Hindi culture, traditions, and cultural context.', 'intermediate', 360, 3, true),
      (2, 'Bengali Fundamentals', 'Basic Bengali vocabulary and pronunciation guide.', 'beginner', 540, 1, true),
      (2, 'Bengali Literature', 'Introduction to Bengali literary traditions and famous works.', 'advanced', 600, 2, true),
      (3, 'Telugu Basics', 'Essential Telugu phrases for travelers and beginners.', 'beginner', 420, 1, true),
      (4, 'Tamil Essentials', 'Core Tamil vocabulary and cultural insights.', 'beginner', 480, 1, true),
      (5, 'Gujarati for Business', 'Business-focused Gujarati language course.', 'intermediate', 360, 1, true)
    ON CONFLICT DO NOTHING;
  `);

  // Insert sample lessons for Hindi Basics course
  await pool.query(`
    INSERT INTO lessons (course_id, title, description, content, lesson_type, order_index, estimated_duration, is_active)
    VALUES 
      (1, 'Introduction to Hindi', 'Learn about Hindi language and its importance', 
       '{"sections": [{"type": "text", "content": "Hindi is the most widely spoken language in India..."}]}', 
       'text', 1, 30, true),
      (1, 'Basic Greetings', 'Common Hindi greetings and polite expressions', 
       '{"sections": [{"type": "vocabulary", "items": [{"hindi": "नमस्ते", "english": "Hello", "pronunciation": "Namaste"}]}]}', 
       'vocabulary', 2, 45, true),
      (1, 'Numbers 1-10', 'Learn to count from 1 to 10 in Hindi', 
       '{"sections": [{"type": "vocabulary", "items": [{"hindi": "एक", "english": "One", "pronunciation": "Ek"}]}]}', 
       'vocabulary', 3, 40, true),
      (1, 'Family Members', 'Hindi words for family relationships', 
       '{"sections": [{"type": "vocabulary", "items": [{"hindi": "माता", "english": "Mother", "pronunciation": "Mata"}]}]}', 
       'vocabulary', 4, 35, true)
    ON CONFLICT DO NOTHING;
  `);

  // Insert demo chat rooms
  await pool.query(`
    INSERT INTO chat_rooms (id, name, primary_language, created_by)
    VALUES 
      ('room-1', 'Hindi Learning Group', 'hi', 1),
      ('room-2', 'Bengali Cultural Exchange', 'bn', 1),
      ('room-3', 'Multi-language Practice', 'en', 2)
    ON CONFLICT (id) DO NOTHING;
  `);

  // Insert demo chat participants
  await pool.query(`
    INSERT INTO chat_participants (room_id, user_id)
    VALUES 
      ((SELECT id FROM chat_rooms WHERE name = 'Hindi Learning Group'), (SELECT id FROM users WHERE email = 'demo@samvaad.ai')),
      ((SELECT id FROM chat_rooms WHERE name = 'Hindi Learning Group'), (SELECT id FROM users WHERE email = 'hindi@samvaad.ai')),
      ((SELECT id FROM chat_rooms WHERE name = 'Bengali Cultural Exchange'), (SELECT id FROM users WHERE email = 'demo@samvaad.ai')),
      ((SELECT id FROM chat_rooms WHERE name = 'Bengali Cultural Exchange'), (SELECT id FROM users WHERE email = 'bengali@samvaad.ai')),
      ((SELECT id FROM chat_rooms WHERE name = 'Multi-language Practice'), (SELECT id FROM users WHERE email = 'demo@samvaad.ai')),
      ((SELECT id FROM chat_rooms WHERE name = 'Multi-language Practice'), (SELECT id FROM users WHERE email = 'hindi@samvaad.ai')),
      ((SELECT id FROM chat_rooms WHERE name = 'Multi-language Practice'), (SELECT id FROM users WHERE email = 'bengali@samvaad.ai'))
    ON CONFLICT (room_id, user_id) DO NOTHING;
  `);

  // Insert demo chat messages
  await pool.query(`
    INSERT INTO chat_messages (room_id, user_id, content, original_language)
    VALUES 
      ((SELECT id FROM chat_rooms WHERE name = 'Hindi Learning Group'), (SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 'Hello everyone! I am learning Hindi.', 'en'),
      ((SELECT id FROM chat_rooms WHERE name = 'Hindi Learning Group'), (SELECT id FROM users WHERE email = 'hindi@samvaad.ai'), 'नमस्ते! मैं आपकी मदद कर सकता हूँ।', 'hi'),
      ((SELECT id FROM chat_rooms WHERE name = 'Bengali Cultural Exchange'), (SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 'I would like to learn about Bengali festivals.', 'en'),
      ((SELECT id FROM chat_rooms WHERE name = 'Bengali Cultural Exchange'), (SELECT id FROM users WHERE email = 'bengali@samvaad.ai'), 'শুভেচ্ছা! আমি আপনাকে বাংলা উৎসব সম্পর্কে শেখাতে পারি।', 'bn')
    ON CONFLICT DO NOTHING;
  `);

  // Insert demo user progress
  await pool.query(`
    INSERT INTO user_course_progress (user_id, course_id, progress_percentage, is_completed)
    VALUES 
      ((SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 1, 75.00, false),
      ((SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 4, 100.00, true),
      ((SELECT id FROM users WHERE email = 'hindi@samvaad.ai'), 1, 25.00, false),
      ((SELECT id FROM users WHERE email = 'bengali@samvaad.ai'), 4, 50.00, false)
    ON CONFLICT (user_id, course_id) DO NOTHING;
  `);

  // Insert demo lesson progress
  await pool.query(`
    INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, score, completed_at)
    VALUES 
      ((SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 1, true, 95, NOW() - INTERVAL '2 days'),
      ((SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 2, true, 88, NOW() - INTERVAL '1 day'),
      ((SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 3, true, 92, NOW() - INTERVAL '6 hours'),
      ((SELECT id FROM users WHERE email = 'hindi@samvaad.ai'), 1, true, 85, NOW() - INTERVAL '3 days')
    ON CONFLICT (user_id, lesson_id) DO NOTHING;
  `);

  // Insert language proficiency
  await pool.query(`
    INSERT INTO language_proficiency (user_id, language_code, proficiency_level, experience_points)
    VALUES 
      ((SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 'hi', 2, 150),
      ((SELECT id FROM users WHERE email = 'demo@samvaad.ai'), 'bn', 1, 50),
      ((SELECT id FROM users WHERE email = 'hindi@samvaad.ai'), 'en', 3, 200),
      ((SELECT id FROM users WHERE email = 'bengali@samvaad.ai'), 'en', 2, 120)
    ON CONFLICT (user_id, language_code) DO NOTHING;
  `);

  // Insert cultural tips
  await pool.query(`
    INSERT INTO cultural_tips (id, language_code, title, content, category, difficulty)
    VALUES
      ('hi-1', 'hi', 'Greeting Etiquette', 'In Hindi culture, "Namaste" with folded hands is a respectful greeting for all ages and social statuses.', 'social', 'beginner'),
      ('hi-2', 'hi', 'Formal vs Informal Speech', 'Hindi has three levels of formality: "आप" (aap) for formal/respectful, "तुम" (tum) for friends/family, and "तू" (tu) for very close relationships.', 'language', 'intermediate'),
      ('hi-3', 'hi', 'Festival Greetings', 'During Diwali, say "Diwali ki Shubhkamnayein" (दिवाली की शुभकामनाएं) for formal wishes.', 'festivals', 'beginner'),
      ('bn-1', 'bn', 'Bengali Greetings', 'In Bengali culture, "Nomoshkar" (নমস্কার) with folded hands is the traditional greeting.', 'social', 'beginner'),
      ('bn-2', 'bn', 'Respect for Elders', 'Bengali culture places high importance on respecting elders. Address older people with "apni" (আপনি) rather than "tumi" (তুমি).', 'social', 'beginner'),
      ('te-1', 'te', 'Telugu Greetings', 'In Telugu, "Namaskaram" (నమస్కారం) is a formal greeting, while "Baagunnara?" (బాగున్నారా?) means "How are you?"', 'social', 'beginner')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Insert language learning tips
  await pool.query(`
    INSERT INTO language_tips (id, language_code, title, content, category, difficulty)
    VALUES
      ('hi-lang-1', 'hi', 'Hindi Pronunciation', 'Hindi has retroflex consonants (ट, ठ, ड, ढ) that are pronounced with the tongue curled back.', 'pronunciation', 'beginner'),
      ('hi-lang-2', 'hi', 'Hindi Sentence Structure', 'Hindi follows Subject-Object-Verb order, unlike English which uses Subject-Verb-Object.', 'grammar', 'intermediate'),
      ('bn-lang-1', 'bn', 'Bengali Vowels', 'Bengali has 7 vowels with both oral and nasal forms, making pronunciation challenging for beginners.', 'pronunciation', 'intermediate'),
      ('bn-lang-2', 'bn', 'Bengali Script', 'Bengali script is derived from the eastern Nagari script and has rounded shapes.', 'writing', 'beginner'),
      ('te-lang-1', 'te', 'Telugu Alphabet', 'Telugu has 56 letters: 16 vowels, 3 vowel modifiers, and 37 consonants.', 'writing', 'beginner')
    ON CONFLICT (id) DO NOTHING;
  `);
}

// Run setup
setupDatabase().catch(console.error);