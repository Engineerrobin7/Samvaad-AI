"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/db/pool.ts
var pg_1 = require("pg");
require("dotenv").config();
var pool;
// Priority: Supabase URL > DATABASE_URL > Local dev config
if (process.env.SUPABASE_DB_URL) {
    pool = new pg_1.Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });
    console.log('📦 Using Supabase DB connection');
}
else if (process.env.DATABASE_URL) {
    pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    console.log('📦 Using Production DATABASE_URL connection');
}
else {
    pool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'samvaad_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: false
    });
    console.log('📦 Using Local development DB connection');
}
exports.default = pool;