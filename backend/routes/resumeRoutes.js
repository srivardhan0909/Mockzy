import express from 'express'
import {
  upload,
  uploadResume,
  getUserResume,
} from '../controllers/resumeController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Upload resume
router.post('/upload', auth, upload.single('resume'), uploadResume)

// Get user's resume
router.get('/user/:userId', auth, getUserResume)

export default router
