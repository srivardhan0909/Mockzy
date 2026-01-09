import { Router } from 'express'
const router = Router()
import {
  getProfile,
  createOrUpdateProfile,
  getCompletedInterviews,
} from '../controllers/interviewerController.js'
import { auth } from '../middleware/auth.js'

// Apply auth middleware to all routes
router.use(auth)

// Get interviewer profile
router.get('/profile', getProfile)

// Create or update interviewer profile
router.post('/profile', createOrUpdateProfile)

// Get completed interviews count
router.get('/completed-interviews', getCompletedInterviews)

export default router
