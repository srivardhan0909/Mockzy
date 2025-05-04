import express from 'express'
import { registerUser, loginUser } from '../controllers/authController.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)

// Protected route example
router.get('/me', auth, (req, res) => {
  res.json(req.user)
})

export default router
