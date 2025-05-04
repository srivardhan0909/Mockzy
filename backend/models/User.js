import pool from '../config/db.js'

export const createUserTable = async () => {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Users table created successfully')

    // Add resume_score column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users'
          AND column_name = 'resume_score'
        ) THEN
          ALTER TABLE users ADD COLUMN resume_score INTEGER DEFAULT 0;
        END IF;
      END $$;
    `)
    console.log('Resume score column added successfully')
  } catch (err) {
    console.error('Error creating users table:', err)
  }
}

export const createResumesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        file_path VARCHAR(255) NOT NULL,
        score INTEGER DEFAULT 0,
        classification VARCHAR(50) DEFAULT 'beginner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Resumes table created successfully')
  } catch (err) {
    console.error('Error creating resumes table:', err)
  }
}
