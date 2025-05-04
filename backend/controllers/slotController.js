import { createSlot, updateSlotStatus } from '../models/Slot.js'
import pool from '../config/db.js'

// Create a new slot (for interviewers)
export const postSlot = async (req, res) => {
  const { date, time, duration, mode } = req.body
  const interviewerId = req.user.id // Get the interviewer's ID from the authenticated user

  try {
    const result = await pool.query(
      'INSERT INTO slots (date, time, duration, mode, admin_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [date, time, duration, mode, interviewerId]
    )
    res
      .status(201)
      .json({ message: 'Slot created successfully', slot: result.rows[0] })
  } catch (err) {
    console.error('Error creating slot:', err.message)
    res.status(500).json({ message: 'Server Error' })
  }
}

// Get all available slots
export const getAllSlots = async (req, res) => {
  try {
    // Get user's classification if they are a candidate
    let userClassification = null
    if (req.user.role === 'candidate') {
      const userResult = await pool.query(
        'SELECT r.classification FROM users u ' +
          'LEFT JOIN resumes r ON u.id = r.user_id ' +
          'WHERE u.id = $1 ' +
          'ORDER BY r.created_at DESC LIMIT 1',
        [req.user.id]
      )
      userClassification = userResult.rows[0]?.classification || 'beginner'
    }

    // Build the query based on user role and classification
    let query =
      'SELECT s.*, u.username as interviewer_name, i.expertise_level ' +
      'FROM slots s ' +
      'LEFT JOIN users u ON s.admin_id = u.id ' +
      'LEFT JOIN interviewers i ON u.id = i.user_id '
    let params = []
    let paramCount = 0

    // Add WHERE clause only if is_booked column exists
    try {
      const columnCheck = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'slots' AND column_name = 'is_booked'"
      )
      if (columnCheck.rows.length > 0) {
        query += 'WHERE s.is_booked = false'
      }
    } catch (err) {
      console.error('Error checking for is_booked column:', err)
    }

    // If user is a candidate, filter slots by their classification
    if (userClassification) {
      try {
        const difficultyCheck = await pool.query(
          "SELECT column_name FROM information_schema.columns WHERE table_name = 'slots' AND column_name = 'difficulty_level'"
        )
        if (difficultyCheck.rows.length > 0) {
          query += query.includes('WHERE') ? ' AND' : ' WHERE'
          paramCount++
          query += ` s.difficulty_level = $${paramCount}`
          params.push(userClassification)
        }
      } catch (err) {
        console.error('Error checking for difficulty_level column:', err)
      }
    }

    query += ' ORDER BY s.date, s.time'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching slots:', err.message)
    res.status(500).json({ message: 'Server Error' })
  }
}

// Book a slot
export const bookSlot = async (req, res) => {
  const { slotId } = req.body
  const userId = req.user.id

  try {
    // Check if slot exists
    const slotResult = await pool.query('SELECT * FROM slots WHERE id = $1', [
      slotId,
    ])

    if (slotResult.rows.length === 0) {
      return res.status(404).json({ message: 'Slot not found' })
    }

    const slot = slotResult.rows[0]

    // Check for time conflicts
    const conflictResult = await pool.query(
      'SELECT * FROM slots WHERE booked_by = $1 AND date = $2',
      [userId, slot.date]
    )

    if (conflictResult.rows.length > 0) {
      // Find alternative slots
      const alternativeSlots = await pool.query(
        'SELECT s.*, u.username as interviewer_name FROM slots s ' +
          'LEFT JOIN users u ON s.admin_id = u.id ' +
          "WHERE s.date = $1 AND s.id != $2 AND s.status = 'available' " +
          'ORDER BY s.time',
        [slot.date, slotId]
      )

      return res.status(409).json({
        conflict: true,
        message: 'You already have a booking for this date',
        alternativeSlots: alternativeSlots.rows,
      })
    }

    // Update slot status and set booked_by
    const updatedSlot = await updateSlotStatus(slotId, true, userId)

    res.json({ message: 'Slot booked successfully', slot: updatedSlot })
  } catch (err) {
    console.error('Error booking slot:', err.message)
    res.status(500).json({ message: 'Server Error' })
  }
}

// Get slots for a specific interviewer
export const getInterviewerSlots = async (req, res) => {
  const interviewerId = req.user.id // Get the interviewer's ID from the authenticated user

  try {
    const result = await pool.query(
      'SELECT s.*, u.username as interviewer_name, i.expertise_level ' +
        'FROM slots s ' +
        'LEFT JOIN users u ON s.admin_id = u.id ' +
        'LEFT JOIN interviewers i ON u.id = i.user_id ' +
        'WHERE s.admin_id = $1 ' +
        'ORDER BY s.date, s.time',
      [interviewerId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching interviewer slots:', err.message)
    res.status(500).json({ message: 'Server Error' })
  }
}

export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    console.log('Deleting slot with ID:', id)
    // First check if the slot exists and belongs to the user
    const checkQuery = `
      SELECT * FROM slots 
      WHERE id = $1 AND admin_id = $2
    `
    const checkResult = await pool.query(checkQuery, [id, userId])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Slot not found or unauthorized' })
    }

    // If slot is booked, prevent deletion
    if (checkResult.rows[0].is_booked) {
      return res.status(400).json({ message: 'Cannot delete a booked slot' })
    }

    // Delete the slot
    const deleteQuery = `
      DELETE FROM slots 
      WHERE id = $1 AND admin_id = $2
    `
    await pool.query(deleteQuery, [id, userId])

    res.json({ message: 'Slot deleted successfully' })
  } catch (err) {
    console.error('Error deleting slot:', err.message)
    res.status(500).json({ message: 'Server Error' })
  }
}

export const getSlots = async (req, res) => {
  try {
    const { classification } = req.query
    const userId = req.user.id

    // Get user's role and resume classification
    const userResult = await pool.query(
      `SELECT u.role, r.classification 
       FROM users u 
       LEFT JOIN resumes r ON u.id = r.user_id 
       WHERE u.id = $1 
       ORDER BY r.created_at DESC LIMIT 1`,
      [userId]
    )
    const userRole = userResult.rows[0].role
    const userClassification = userResult.rows[0]?.classification || 'beginner'

    let query = `
      SELECT s.*, 
             u.username as interviewer_name,
             u.expertise_level as interviewer_level
      FROM slots s
      JOIN users u ON s.admin_id = u.id
      WHERE s.is_booked = false
    `

    // If user is a candidate, filter slots by their classification
    if (userRole === 'candidate') {
      query += ` AND u.expertise_level = $1`
      const result = await pool.query(query, [userClassification])
      return res.json(result.rows)
    }

    // For interviewers or admin, show all slots
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching slots:', err)
    res.status(500).json({ message: 'Server Error' })
  }
}
