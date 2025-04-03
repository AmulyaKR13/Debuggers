import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle instance with the schema
export const db = drizzle(pool, { schema });

// Helper function to run migrations
export async function runMigrations() {
  try {
    console.log('Creating database tables if they do not exist...');
    
    // Create tables using our schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        skill_id INTEGER NOT NULL REFERENCES skills(id),
        proficiency INTEGER NOT NULL,
        last_used TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, skill_id)
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        assigned_to_user_id INTEGER REFERENCES users(id),
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE,
        ai_match_score REAL,
        required_skills INTEGER[],
        cognitive_load REAL,
        sentiment_score REAL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS availabilities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        status TEXT NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Seed some default skills if the skills table is empty
    const skillsCount = await db.select({ count: schema.skills.id }).from(schema.skills);
    if (skillsCount.length === 0 || skillsCount[0].count === 0) {
      console.log('Seeding default skills...');
      // Insert skills one by one to avoid type issues
      await db.insert(schema.skills).values({ name: 'JavaScript', category: 'Programming', description: 'JavaScript programming language' });
      await db.insert(schema.skills).values({ name: 'React', category: 'Frontend', description: 'React library for building user interfaces' });
      await db.insert(schema.skills).values({ name: 'Node.js', category: 'Backend', description: 'Node.js runtime environment' });
      await db.insert(schema.skills).values({ name: 'PostgreSQL', category: 'Database', description: 'PostgreSQL database management' });
      await db.insert(schema.skills).values({ name: 'UI Design', category: 'Design', description: 'User interface design' });
      await db.insert(schema.skills).values({ name: 'UX Research', category: 'Research', description: 'User experience research' });
      await db.insert(schema.skills).values({ name: 'Project Management', category: 'Management', description: 'Project management skills' });
      await db.insert(schema.skills).values({ name: 'DevOps', category: 'Operations', description: 'Development operations' });
      await db.insert(schema.skills).values({ name: 'Python', category: 'Programming', description: 'Python programming language' });
      await db.insert(schema.skills).values({ name: 'Machine Learning', category: 'AI/ML', description: 'Machine learning concepts and tools' });
    }
    
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up the database:', error);
    throw error;
  }
}