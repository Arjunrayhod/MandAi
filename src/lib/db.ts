import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || '';

// Neon Serverless SQL client
export const sql = connectionString ? neon(connectionString) : null;

/**
 * Initialize Neon PostgreSQL Tables for MandAi
 * Permanent 24/7 cloud storage for users, invoices, parties, saudas, and settings.
 */
export async function initDatabase() {
  if (!sql) {
    return { success: false, error: 'DATABASE_URL not configured' };
  }

  try {
    // 1. Users table (permanent authentication across devices)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(50),
        company_name VARCHAR(200),
        is_demo BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. User Storage table (stores complete user state as JSONB in PostgreSQL)
    await sql`
      CREATE TABLE IF NOT EXISTS user_storage (
        user_id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return { success: true };
  } catch (error: any) {
    console.error('Neon DB init error:', error);
    return { success: false, error: error.message };
  }
}
