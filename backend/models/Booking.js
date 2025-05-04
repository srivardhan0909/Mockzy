import pool from '../config/db.js';

export const createBooking = async ({ slot_id, user_id }) => {
  const result = await pool.query(
    `INSERT INTO bookings (slot_id, user_id)
     VALUES ($1, $2) RETURNING *`,
    [slot_id, user_id]
  );
  return result.rows[0];
};

export const getAllBookings = async () => {
  const result = await pool.query('SELECT * FROM bookings');
  return result.rows;
};

export const getBookingsBySlotId = async (slot_id) => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE slot_id = $1`,
    [slot_id]
  );
  return result.rows;
};
