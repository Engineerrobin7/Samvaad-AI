import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'samvaad_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
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
      ('room-1', 1),
      ('room-1', 2),
      ('room-2', 1),
      ('room-2', 3),
      ('room-3', 1),
      ('room-3', 2),
      ('room-3', 3)
    ON CONFLICT (room_id, user_id) DO NOTHING;
  `);

  // Insert demo chat messages
  await pool.query(`
    INSERT INTO chat_messages (room_id, user_id, message, original_language)
    VALUES 
      ('room-1', 1, 'Hello everyone! I am learning Hindi.', 'en'),
      ('room-1', 2, 'नमस्ते! मैं आपकी मदद कर सकता हूँ।', 'hi'),
      ('room-2', 1, 'I would like to learn about Bengali festivals.', 'en'),
      ('room-2', 3, 'শুভেচ্ছা! আমি আপনাকে বাংলা উৎসব সম্পর্কে শেখাতে পারি।', 'bn')
    ON CONFLICT DO NOTHING;
  `);

  // Insert demo language proficiency
  await pool.query(`
    INSERT INTO language_proficiency (user_id, language_code, proficiency_level, experience_points)
    VALUES 
      (1, 'hi', 2, 150),
      (1, 'bn', 1, 50),
      (2, 'en', 3, 200),
      (3, 'en', 2, 120)
    ON CONFLICT (user_id, language_code) DO NOTHING;
  `);

  // Insert demo cultural tips
  await pool.query(`
    INSERT INTO cultural_tips (id, language_code, title, content, category, difficulty)
    VALUES
      ('hi-1', 'hi', 'Greeting Etiquette', 'In Hindi culture, "Namaste" with folded hands is a respectful greeting for all ages and social statuses.', 'social', 'beginner'),
      ('hi-2', 'hi', 'Formal vs Informal Speech', 'Hindi has three levels of formality: "आप" (aap) for formal/respectful, "तुम" (tum) for friends/family, and "तू" (tu) for very close relationships or children.', 'language', 'intermediate'),
      ('hi-3', 'hi', 'Festival Greetings', 'During Diwali, say "Diwali ki Shubhkamnayein" (दिवाली की शुभकामनाएं) for formal wishes or "Happy Diwali" in casual settings.', 'festivals', 'beginner'),
      ('bn-1', 'bn', 'Bengali Greetings', 'In Bengali culture, "Nomoshkar" (নমস্কার) with folded hands is the traditional greeting, while "Kemon acho?" (কেমন আছো?) means "How are you?"', 'social', 'beginner'),
      ('bn-2', 'bn', 'Respect for Elders', 'Bengali culture places high importance on respecting elders. Address older people with "apni" (আপনি) rather than "tumi" (তুমি).', 'social', 'beginner'),
      ('te-1', 'te', 'Telugu Greetings', 'In Telugu, "Namaskaram" (నమస్కారం) is a formal greeting, while "Baagunnara?" (బాగున్నారా?) means "How are you?"', 'social', 'beginner'),
      ('te-2', 'te', 'Telugu Festivals', 'During Sankranti, a major harvest festival, Telugu people exchange "Sankranti Shubhakankshalu" (సంక్రాంతి శుభాకాంక్షలు) as greetings.', 'festivals', 'intermediate')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Insert demo language learning tips
  await pool.query(`
    INSERT INTO language_tips (id, language_code, title, content, category, difficulty)
    VALUES
      ('hi-lang-1', 'hi', 'Hindi Pronunciation', 'Hindi has retroflex consonants (ट, ठ, ड, ढ) that are pronounced with the tongue curled back.', 'pronunciation', 'beginner'),
      ('hi-lang-2', 'hi', 'Hindi Sentence Structure', 'Hindi follows Subject-Object-Verb order, unlike English which uses Subject-Verb-Object.', 'grammar', 'intermediate'),
      ('bn-lang-1', 'bn', 'Bengali Vowels', 'Bengali has 7 vowels with both oral and nasal forms, making pronunciation challenging for beginners.', 'pronunciation', 'intermediate'),
      ('bn-lang-2', 'bn', 'Bengali Script', 'Bengali script is derived from the eastern Nagari script and has rounded shapes due to the traditional writing materials used.', 'writing', 'beginner'),
      ('te-lang-1', 'te', 'Telugu Alphabet', 'Telugu has 56 letters: 16 vowels, 3 vowel modifiers, and 37 consonants.', 'writing', 'beginner'),
      ('te-lang-2', 'te', 'Telugu Pronunciation', 'Telugu distinguishes between short and long vowels, which can change the meaning of words.', 'pronunciation', 'intermediate')
    ON CONFLICT (id) DO NOTHING;
  `);
}

// Run setup
setupDatabase().catch(console.error);