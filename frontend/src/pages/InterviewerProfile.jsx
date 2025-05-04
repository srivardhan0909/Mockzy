import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const InterviewerProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    current_occupation: '',
    experience: '',
    expertise_level: 'beginner',
    bio: '',
    location: '',
    skills: [],
    certifications: [],
  })
  const [error, setError] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'interviewer') {
      navigate('/login')
      return
    }
    fetchExistingProfile()
  }, [navigate])

  const fetchExistingProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:3000/api/interviewers/profile',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.data) {
        setProfile({
          name: response.data.name || '',
          current_occupation: response.data.current_occupation || '',
          experience: response.data.experience || '',
          expertise_level: response.data.expertise_level || 'beginner',
          bio: response.data.bio || '',
          location: response.data.location || '',
          skills: Array.isArray(response.data.skills)
            ? response.data.skills
            : [],
          certifications: Array.isArray(response.data.certifications)
            ? response.data.certifications
            : [],
        })
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching profile:', error)
        setError('Failed to fetch profile')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to continue')
        return
      }

      // Ensure arrays are properly formatted
      const formattedProfile = {
        name: profile.name,
        current_occupation: profile.current_occupation,
        experience: profile.experience,
        expertise_level: profile.expertise_level,
        bio: profile.bio || '',
        location: profile.location || '',
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        certifications: Array.isArray(profile.certifications)
          ? profile.certifications
          : [],
      }

      const response = await axios.post(
        'http://localhost:3000/api/interviewers/profile',
        formattedProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data) {
        setProfile(response.data)
        setError('')
        navigate('/interviewer-dashboard')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError(error.response?.data?.message || 'Failed to save profile')
    }
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile({
        ...profile,
        skills: [
          ...(Array.isArray(profile.skills) ? profile.skills : []),
          newSkill.trim(),
        ],
      })
      setNewSkill('')
    }
  }

  const removeSkill = (index) => {
    setProfile({
      ...profile,
      skills: (Array.isArray(profile.skills) ? profile.skills : []).filter(
        (_, i) => i !== index
      ),
    })
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile({
        ...profile,
        certifications: [
          ...(Array.isArray(profile.certifications)
            ? profile.certifications
            : []),
          newCertification.trim(),
        ],
      })
      setNewCertification('')
    }
  }

  const removeCertification = (index) => {
    setProfile({
      ...profile,
      certifications: (Array.isArray(profile.certifications)
        ? profile.certifications
        : []
      ).filter((_, i) => i !== index),
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Interviewer Profile
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Occupation
            </label>
            <input
              type="text"
              value={profile.current_occupation}
              onChange={(e) =>
                setProfile({ ...profile, current_occupation: e.target.value })
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Years of Experience
            </label>
            <input
              type="number"
              value={profile.experience}
              onChange={(e) =>
                setProfile({ ...profile, experience: e.target.value })
              }
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expertise Level
            </label>
            <select
              value={profile.expertise_level}
              onChange={(e) =>
                setProfile({ ...profile, expertise_level: e.target.value })
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="moderate">Moderate</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Skills
            </label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add a skill"
              />
              <button
                type="button"
                onClick={addSkill}
                className="ml-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(profile.skills) &&
                profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certifications
            </label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add a certification"
              />
              <button
                type="button"
                onClick={addCertification}
                className="ml-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(profile.certifications) &&
                profile.certifications.map((certification, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {certification}
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InterviewerProfile
