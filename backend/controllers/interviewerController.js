import Interviewer from '../models/Interviewer.js'

const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const interviewer = await Interviewer.findOne({
      where: { userId: req.user.id },
    })

    if (!interviewer) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.json(interviewer)
  } catch (error) {
    console.error('Error fetching interviewer profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const createOrUpdateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const {
      name,
      current_occupation,
      experience,
      expertise_level,
      bio,
      location,
      skills,
      certifications,
    } = req.body

    // Validate required fields
    if (!name || !current_occupation || !experience || !expertise_level) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const [interviewer, created] = await Interviewer.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        name,
        current_occupation,
        experience: parseInt(experience),
        expertise_level,
        bio: bio || null,
        location: location || null,
        skills: Array.isArray(skills) ? skills : [],
        certifications: Array.isArray(certifications) ? certifications : [],
      },
    })

    if (!created) {
      await Interviewer.update(interviewer.id, {
        name,
        current_occupation,
        experience: parseInt(experience),
        expertise_level,
        bio: bio || null,
        location: location || null,
        skills: Array.isArray(skills) ? skills : [],
        certifications: Array.isArray(certifications) ? certifications : [],
      })
    }

    // Fetch the updated profile
    const updatedProfile = await Interviewer.findOne({
      where: { userId: req.user.id },
    })

    // console.log('Interviewer profile saved:', updatedProfile)

    res.json(updatedProfile)
  } catch (error) {
    console.error('Error saving interviewer profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export { getProfile, createOrUpdateProfile }
