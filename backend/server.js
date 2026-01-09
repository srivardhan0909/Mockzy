import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js' // Import routes
import slotRoutes from './routes/slotRoutes.js'
import interviewerRoutes from './routes/interviewerRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import { createUserTable, createResumesTable } from './models/User.js'
import { createSlotsTable, createCompletionsTable } from './models/Slot.js'

// Initialize dotenv
dotenv.config()

// Create an express app
const app = express()

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await createUserTable()
    await createResumesTable()
    await createSlotsTable()
    await createCompletionsTable()
    console.log('Database tables initialized successfully')
  } catch (err) {
    console.error('Error initializing database tables:', err)
  }
}

// Call the initialization function
initializeDatabase()

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something broke!' })
})

// Set routes
app.use('/api/auth', authRoutes) // Mount authRoutes at "/api/auth"
app.use('/api/slots', slotRoutes)
app.use('/api/interviewers', interviewerRoutes)
app.use('/api/resumes', resumeRoutes)

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend server is running!')
})

// Set PORT
const PORT = process.env.PORT || 3000

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`)
})
