import pool from '../config/db.js'

export const createSlotsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slots (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES users(id),
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER NOT NULL,
        mode VARCHAR(50) NOT NULL,
        is_booked BOOLEAN DEFAULT false,
        expertise_level VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'available',
        booked_by INTEGER REFERENCES users(id),
        meeting_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Slots table created successfully')
    
    // Add meeting_link column if it doesn't exist (for existing tables)
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='slots' AND column_name='meeting_link') THEN
          ALTER TABLE slots ADD COLUMN meeting_link VARCHAR(255);
        END IF;
      END $$;
    `)
  } catch (err) {
    console.error('Error creating slots table:', err)
  }
}

// This is a helper model to manage slot-related DB operations
export const createSlot = async ({
  admin_id,
  date,
  time,
  duration,
  mode,
  expertise_level,
}) => {
  const result = await pool.query(
    'INSERT INTO slots (admin_id, date, time, duration, mode, expertise_level, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [admin_id, date, time, duration, mode, expertise_level, 'available']
  )
  return result.rows[0]
}

// Update slot status based on booking
export const updateSlotStatus = async (slotId, isBooked, bookedBy = null) => {
  const status = isBooked ? 'booked' : 'available'
  const result = await pool.query(
    'UPDATE slots SET status = $1, is_booked = $2, booked_by = $3 WHERE id = $4 RETURNING *',
    [status, isBooked, bookedBy, slotId]
  )
  return result.rows[0]
}

// Track completed interviews
export const recordCompletedInterview = async (interviewerId) => {
  try {
    // Check if the interviewer has a completion record
    const checkResult = await pool.query(
      'SELECT * FROM interview_completions WHERE interviewer_id = $1',
      [interviewerId]
    )

    if (checkResult.rows.length === 0) {
      // Create a new record if none exists
      await pool.query(
        'INSERT INTO interview_completions (interviewer_id, completed_count) VALUES ($1, 1)',
        [interviewerId]
      )
    } else {
      // Increment the existing counter
      await pool.query(
        'UPDATE interview_completions SET completed_count = completed_count + 1 WHERE interviewer_id = $1',
        [interviewerId]
      )
    }

    // Return the updated count
    const result = await pool.query(
      'SELECT completed_count FROM interview_completions WHERE interviewer_id = $1',
      [interviewerId]
    )

    return result.rows[0]?.completed_count || 1
  } catch (err) {
    console.error('Error recording completed interview:', err)
    return 0
  }
}

// Get completed interview count for an interviewer
export const getCompletedInterviewCount = async (interviewerId) => {
  try {
    const result = await pool.query(
      'SELECT completed_count FROM interview_completions WHERE interviewer_id = $1',
      [interviewerId]
    )

    return result.rows[0]?.completed_count || 0
  } catch (err) {
    console.error('Error getting completed interview count:', err)
    return 0
  }
}

export const createCompletionsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interview_completions (
        id SERIAL PRIMARY KEY,
        interviewer_id INTEGER REFERENCES users(id),
        completed_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Interview completions table created successfully')
  } catch (err) {
    console.error('Error creating interview completions table:', err)
  }
}
