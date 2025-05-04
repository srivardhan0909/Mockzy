import { Router } from 'express'
const router = Router()
import { getProfile, createOrUpdateProfile } from '../controllers/interviewerController.js'
import { auth } from '../middleware/auth.js'

// Apply auth middleware to all routes
router.use(auth)

// Get interviewer profile
router.get('/profile', getProfile)

// Create or update interviewer profile
router.post('/profile', createOrUpdateProfile)

export default router
