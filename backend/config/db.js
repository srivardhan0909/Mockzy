import pg from 'pg'
import dotenv from 'dotenv'

// Initialize dotenv
dotenv.config()

// Use DATABASE_URL for cloud deployment (Neon, Render, etc.)
const pool = process.env.DATABASE_URL 
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new pg.Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'mockzy',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    })

// Initialize database tables
const initDB = async () => {
  try {
    // Create users table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

    // Create slots table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS slots (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                interviewer_id INTEGER REFERENCES users(id),
                is_booked BOOLEAN DEFAULT false,
                booked_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

    // Create interviewers table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS interviewers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) NOT NULL,
                name VARCHAR(255) NOT NULL,
                current_occupation VARCHAR(255) NOT NULL,
                experience INTEGER NOT NULL,
                expertise_level VARCHAR(50) NOT NULL CHECK (expertise_level IN ('beginner', 'moderate', 'expert')),
                bio TEXT,
                location VARCHAR(255),
                skills TEXT[],
                certifications TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

    console.log('Database tables initialized successfully')
  } catch (err) {
    console.error('Error initializing database:', err)
  }
}

// Initialize database on startup
initDB()

export default pool
