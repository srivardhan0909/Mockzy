import { createBooking, getAllBookings, getBookingsBySlotId } from '../models/booking.js';
import pool from '../config/db.js'; 
import Heap from 'heap-js';

export const bookSlot = async (req, res) => {
  const { slot_id, user_id } = req.body;

  try {
    const booking = await createBooking({ slot_id, user_id });
    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error('Error booking slot:', err.message);
    res.status(500).json({ message: 'Server error while booking slot' });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err.message);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

export const detectBookingConflicts = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT slot_id, COUNT(*) as booking_count, array_agg(user_id) as users
        FROM bookings
        GROUP BY slot_id
        HAVING COUNT(*) > 1
      `);
  
      res.json({ conflicts: result.rows });
    } catch (err) {
      console.error('Error detecting booking conflicts:', err.message);
      res.status(500).json({ message: 'Server error while detecting conflicts' });
    }
  };


  export const suggestAlternateSlots = async (req, res) => {
    const { slot_id } = req.params;
    const limit = parseInt(req.query.limit) || 3;
  
    try {
      const { rows: [orig] } = await pool.query(
        'SELECT * FROM slots WHERE id = $1',
        [slot_id]
      );
      if (!orig) return res.status(404).json({ message: 'Slot not found' });
  
      const { rows: allSlots } = await pool.query(`
        SELECT s.*, COUNT(b.id) AS bookings
        FROM slots s
        LEFT JOIN bookings b ON s.id = b.slot_id
        WHERE s.date = $1
        GROUP BY s.id
        HAVING COUNT(b.id) < 1
      `, [orig.date]);
  
      const origTime = new Date(`${orig.date}T${orig.time}`).getTime();
  
      const heap = new Heap.Heap((a, b) => a.diff - b.diff);
      allSlots.forEach(slot => {
        const slotTime = new Date(`${slot.date}T${slot.time}`).getTime();
        heap.push({ slot, diff: Math.abs(slotTime - origTime) });
      });
  
      const suggestions = [];
      for (let i = 0; i < limit && heap.size() > 0; i++) {
        suggestions.push(heap.pop().slot);
      }
  
      res.json({ suggestions });
    } catch (err) {
      console.error('Error suggesting slots:', err.message);
      res.status(500).json({ message: 'Server error while suggesting slots' });
    }
  };
  