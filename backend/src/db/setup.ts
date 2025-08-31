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
}

// Run setup
setupDatabase().catch(console.error);