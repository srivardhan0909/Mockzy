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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Slots table created successfully')
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
