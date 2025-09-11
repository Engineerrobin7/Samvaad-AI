import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || "postgresql://username:password@host:port/database",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default pool;
