import pool from '../config/db.js' // Database connection
import jwt from 'jsonwebtoken'

// Register a new user
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body

  // Validate required fields
  if (!username || !email || !password || !role) {
    return res.status(400).json({ 
      message: 'All fields are required',
      missing: {
        username: !username,
        email: !email,
        password: !password,
        role: !role
      }
    })
  }

  try {
    // Check if the email already exists using raw SQL
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' })
    }

    // Check if username already exists
    const existingUsername = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ message: 'Username already taken.' })
    }

    // If email not taken, insert new user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, password, role]
    )

    res
      .status(201)
      .json({ message: 'Registration successful!', user: newUser.rows[0] })
  } catch (err) {
    console.error('Registration error:', err.message)
    res.status(500).json({ message: 'Server Error', error: err.message })
  }
}

// Login a user
export const loginUser = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    )

    if (user.rows.length > 0) {
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.rows[0].id,
          username: user.rows[0].username,
          role: user.rows[0].role,
        },
        process.env.JWT_SECRET || 'your-secret-key', // Use environment variable for production
        { expiresIn: '24h' }
      )

      // Return token and user data
      res.json({
        token,
        user: {
          id: user.rows[0].id,
          username: user.rows[0].username,
          email: user.rows[0].email,
          role: user.rows[0].role,
        },
      })
    } else {
      res.status(400).json({ message: 'Invalid Credentials' })
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}
