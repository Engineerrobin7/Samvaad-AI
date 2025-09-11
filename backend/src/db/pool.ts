// src/db/pool.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool;

// Priority: Supabase URL > DATABASE_URL > Local dev config
if (process.env.SUPABASE_DB_URL) {
  pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('📦 Using Supabase DB connection');
} else if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('📦 Using Production DATABASE_URL connection');
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'samvaad_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: false
  });
  console.log('📦 Using Local development DB connection');
}

export default pool;
