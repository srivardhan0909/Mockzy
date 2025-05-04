import express from 'express'
import {
  getAllSlots,
  bookSlot,
  postSlot,
  getInterviewerSlots,
  deleteSlot,
} from '../controllers/slotController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get all available slots
router.get('/', auth, getAllSlots)

// Get slots for the logged-in interviewer
router.get('/my-slots', auth, getInterviewerSlots)

// Book a slot
router.post('/book', auth, bookSlot)

// Create a new slot (interviewer only)
router.post('/', auth, postSlot)

// Delete a slot
router.delete('/:id', auth, deleteSlot)

export default router
