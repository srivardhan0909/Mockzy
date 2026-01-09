import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button, Spinner } from 'flowbite-react'
import { API_BASE } from '../utils/api'

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE}/interviewers/profile`,
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
      setLoading(false)
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching profile:', error)
        setError('Failed to fetch profile')
      }
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to continue')
        setSaving(false)
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
        `${API_BASE}/interviewers/profile`,
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
      setSaving(false)
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Interviewer Profile
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Button disabled>
              <Spinner size="sm" className="me-3" />
              Loading...
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
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
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
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
                    setProfile({
                      ...profile,
                      current_occupation: e.target.value,
                    })
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
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
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

              <div className="flex flex-wrap gap-2 mb-4">
                <label className="w-full block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills
                </label>
                {Array.isArray(profile.skills) &&
                  profile.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => removeSkill(index)}
                        className="ml-2 p-1"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                <div className="flex w-full mt-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    color="blue"
                    onClick={addSkill}
                    className="rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <label className="w-full block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Certifications
                </label>
                {Array.isArray(profile.certifications) &&
                  profile.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                    >
                      {cert}
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => removeCertification(index)}
                        className="ml-2 p-1"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                <div className="flex w-full mt-2">
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add a certification"
                    className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    color="green"
                    onClick={addCertification}
                    className="rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  color="blue"
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-3" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
                <Button
                  type="button"
                  color="light"
                  className="w-full"
                  onClick={() => navigate('/interviewer-dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default InterviewerProfile
