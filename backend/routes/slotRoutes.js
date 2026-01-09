import express from 'express'
import {
  getAllSlots,
  bookSlot,
  postSlot,
  getInterviewerSlots,
  deleteSlot,
  getSlotById,
  markSlotComplete,
  getUserBookings,
  cancelBooking,
} from '../controllers/slotController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get all available slots
router.get('/', auth, getAllSlots)

// Get slots for the logged-in interviewer
router.get('/my-slots', auth, getInterviewerSlots)

// Get bookings for the current user
router.get('/my-bookings', auth, getUserBookings)

// Book a slot
router.post('/book', auth, bookSlot)

// Cancel a booking (for candidates)
router.post('/:id/cancel', auth, cancelBooking)

// Check if slot is available for booking
router.get('/:id', auth, getSlotById)

// Create a new slot (interviewer only)
router.post('/', auth, postSlot)

// Delete a slot
router.delete('/:id', auth, deleteSlot)

// Mark a slot as complete (interviewer only)
router.post('/:id/complete', auth, markSlotComplete)

export default router
