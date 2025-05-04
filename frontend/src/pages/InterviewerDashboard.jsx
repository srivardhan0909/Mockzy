import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import SlotCard from '../components/SlotCard'

const InterviewerDashboard = () => {
  const [slots, setSlots] = useState([])
  const [profile, setProfile] = useState(null)
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    duration: 30,
    mode: 'online',
  })
  const [error, setError] = useState('')
  const [slotStats, setSlotStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
  })
  const navigate = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'interviewer') {
      navigate('/login')
      return
    }
    fetchProfile()
    fetchSlots()
  }, [navigate])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:3000/api/interviewers/profile',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setProfile(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error.response?.status === 404) {
        navigate('/interviewer-profile')
      }
    }
  }

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:3000/api/slots/my-slots',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSlots(response.data)

      // Calculate slot statistics
      const stats = {
        total: response.data.length,
        available: response.data.filter((slot) => !slot.is_booked).length,
        booked: response.data.filter((slot) => slot.is_booked).length,
      }
      setSlotStats(stats)
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError('Failed to fetch slots')
    }
  }

  const handleCreateSlot = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:3000/api/slots', newSlot, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNewSlot({ date: '', time: '', duration: 30, mode: 'online' })
      fetchSlots()
    } catch (error) {
      console.error('Error creating slot:', error)
      setError(error.response?.data?.message || 'Failed to create slot')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Interviewer Dashboard
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/interviewer-profile')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/slot-management')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Manage Slots
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Slot Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Slots</h3>
            <p className="text-3xl font-bold text-blue-600">
              {slotStats.total}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Available Slots
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {slotStats.available}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Booked Slots
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {slotStats.booked}
            </p>
          </div>
        </div>

        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Occupation</p>
                <p className="font-medium">{profile.current_occupation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">{profile.experience} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expertise Level</p>
                <p className="font-medium capitalize">
                  {profile.expertise_level}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">
                  {profile.location || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bio</p>
                <p className="font-medium">
                  {profile.bio || 'No bio provided'}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {profile.certifications && profile.certifications.length > 0 ? (
                  profile.certifications.map((certification, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {certification}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No certifications added</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewerDashboard
