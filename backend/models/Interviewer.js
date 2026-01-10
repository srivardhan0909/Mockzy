import pool from '../config/db.js'

class Interviewer {
  static async findOne({ where }) {
    const { userId } = where
    const query = `
      SELECT * FROM interviewers 
      WHERE user_id = $1
    `
    const result = await pool.query(query, [userId])
    return result.rows[0]
  }

  static async findOrCreate({ where, defaults }) {
    const { userId } = where
    const {
      name,
      current_occupation,
      experience,
      expertise_level,
      bio,
      location,
      skills,
      certifications,
    } = defaults

    // First try to find existing interviewer
    const existingInterviewer = await this.findOne({ where })
    if (existingInterviewer) {
      return [existingInterviewer, false]
    }

    // If not found, create new interviewer
    const query = `
      INSERT INTO interviewers 
      (user_id, name, current_occupation, experience, expertise_level, bio, location, skills, certifications)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::text[])
      RETURNING *
    `
    const result = await pool.query(query, [
      userId,
      name,
      current_occupation,
      experience,
      expertise_level,
      bio || null,
      location || null,
      skills || [],
      certifications || [],
    ])
    return [result.rows[0], true]
  }

  static async update(id, data) {
    const {
      name,
      current_occupation,
      experience,
      expertise_level,
      bio,
      location,
      skills,
      certifications,
    } = data
    const query = `
      UPDATE interviewers 
      SET name = $1,
          current_occupation = $2,
          experience = $3,
          expertise_level = $4,
          bio = $5,
          location = $6,
          skills = $7::text[],
          certifications = $8::text[]
      WHERE id = $9
      RETURNING *
    `
    const result = await pool.query(query, [
      name,
      current_occupation,
      experience,
      expertise_level,
      bio || null,
      location || null,
      skills || [],
      certifications || [],
      id,
    ])
    return result.rows[0]
  }
}

export default Interviewer
