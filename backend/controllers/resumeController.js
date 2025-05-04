import { spawn } from 'child_process'
import path from 'path'
import pool from '../config/db.js'
import multer from 'multer'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, '..', 'uploads', 'resumes')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true)
    } else {
      cb(
        new Error('Invalid file type. Only PDF and Word documents are allowed.')
      )
    }
  },
})

// Helper function to extract text from PDF using pdfjs-dist
const extractTextFromPDF = async (filePath) => {
  try {
    console.log('Attempting to read PDF file from:', filePath)
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    const data = new Uint8Array(fs.readFileSync(filePath))
    const pdf = await pdfjsLib.getDocument({ data }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item) => item.str).join(' ') + '\n'
    }
    console.log('Text extracted successfully, length:', text.length)
    return text
  } catch (err) {
    console.error('Error extracting text from PDF:', err)
    throw new Error(`Failed to extract text from PDF: ${err.message}`)
  }
}

// Helper function to calculate resume score
const calculateResumeScore = (resumeText) => {
  console.log('Analyzing resume text:', resumeText.substring(0, 200)) // Debug log

  // Define scoring criteria with weights
  const criteria = {
    education: {
      weight: 25,
      keywords: [
        'education',
        'degree',
        'university',
        'college',
        'bachelor',
        'master',
        'phd',
        'school',
        'institute',
        'academic',
      ],
    },
    experience: {
      weight: 35,
      keywords: [
        'experience',
        'work',
        'job',
        'employment',
        'role',
        'position',
        'responsibilities',
        'achievements',
        'company',
        'organization',
      ],
    },
    skills: {
      weight: 25,
      keywords: [
        'skills',
        'technologies',
        'tools',
        'programming',
        'languages',
        'frameworks',
        'libraries',
        'databases',
        'cloud',
        'devops',
      ],
    },
    projects: {
      weight: 10,
      keywords: [
        'projects',
        'portfolio',
        'work samples',
        'case studies',
        'implementations',
        'developments',
        'applications',
      ],
    },
    certifications: {
      weight: 5,
      keywords: [
        'certifications',
        'certificates',
        'training',
        'courses',
        'workshops',
        'accreditations',
      ],
    },
  }

  // Convert resume text to lowercase for case-insensitive matching
  const lowerResumeText = resumeText.toLowerCase()
  console.log('Resume text length:', lowerResumeText.length) // Debug log

  // Calculate section scores
  let totalScore = 0
  let sectionScores = {}

  for (const [section, { weight, keywords }] of Object.entries(criteria)) {
    // Count keyword matches
    const matches = keywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi')
      const matchCount = (lowerResumeText.match(regex) || []).length
      if (matchCount > 0) {
        console.log(`Found ${matchCount} matches for ${keyword} in ${section}`) // Debug log
      }
      return count + matchCount
    }, 0)

    // Calculate section score (max 100 points per section)
    const sectionScore = Math.min(matches * 10, 100)
    sectionScores[section] = sectionScore
    console.log(`${section} score: ${sectionScore}`) // Debug log

    // Add weighted score to total
    totalScore += (sectionScore * weight) / 100
  }

  console.log('Total score:', totalScore) // Debug log

  // Determine classification based on total score
  let classification = 'beginner'
  if (totalScore >= 80) {
    classification = 'expert'
  } else if (totalScore >= 50) {
    classification = 'moderate'
  }

  return {
    score: Math.round(totalScore),
    classification,
    sectionScores,
  }
}

// Upload and analyze resume
export const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded' })
  }

  const userId = req.user.id
  const filePath = req.file.path
  const fileName = req.file.filename

  try {
    console.log('Processing resume upload for user:', userId)
    console.log('File path:', filePath)
    console.log('File name:', fileName)

    // Check if user already has a resume
    const existingResume = await pool.query(
      'SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    )

    if (existingResume.rows.length > 0) {
      // Clean up the uploaded file
      fs.unlinkSync(filePath)
      return res
        .status(400)
        .json({ message: 'You already have a resume uploaded' })
    }

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(filePath)
    if (!resumeText) {
      throw new Error('Failed to extract text from PDF')
    }

    // Analyze resume content
    const { score, classification, sectionScores } =
      calculateResumeScore(resumeText)

    // Save to database
    const result = await pool.query(
      'INSERT INTO resumes (user_id, file_path, score, classification) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, `uploads/resumes/${fileName}`, score, classification]
    )

    // Update user's resume score
    await pool.query('UPDATE users SET resume_score = $1 WHERE id = $2', [
      score,
      userId,
    ])

    res.json({
      message: 'Resume uploaded and analyzed successfully',
      resume: result.rows[0],
      analysis: {
        score,
        classification,
        sectionScores,
      },
    })
  } catch (err) {
    console.error('Error uploading resume:', err)
    // Clean up the uploaded file in case of error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    res.status(500).json({
      message: 'Server Error',
      error: err.message,
      details: err.stack,
    })
  }
}

// Get user's resume
export const getUserResume = async (req, res) => {
  const userId = req.params.userId

  try {
    const result = await pool.query(
      'SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No resume found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Error fetching resume:', err)
    res.status(500).json({ message: 'Server Error' })
  }
}
