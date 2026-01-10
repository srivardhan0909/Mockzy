import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import SlotCard from '../components/SlotCard'
import { toast } from 'react-toastify'
import { Button, Spinner } from 'flowbite-react'
import { API_BASE } from '../utils/api'

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
  const [bookedSlots, setBookedSlots] = useState([])
  const [completedCount, setCompletedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'interviewer') {
      navigate('/login')
      return
    }
    fetchData()
  }, [navigate])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchProfile(),
        fetchSlots(),
        fetchCompletedInterviews(),
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE}/interviewers/profile`,
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
        `${API_BASE}/slots/my-slots`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSlots(response.data)

      // Set booked slots
      const booked = response.data.filter((slot) => slot.is_booked)
      setBookedSlots(booked)

      // Calculate slot statistics
      const stats = {
        total: response.data.length,
        available: response.data.filter((slot) => !slot.is_booked).length,
        booked: booked.length,
      }
      setSlotStats(stats)
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError('Failed to fetch slots')
    }
  }

  const fetchCompletedInterviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE}/interviewers/completed-interviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setCompletedCount(response.data.completed_count)
    } catch (error) {
      console.error('Error fetching completed interviews:', error)
    }
  }

  const handleCreateSlot = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE}/slots`, newSlot, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNewSlot({ date: '', time: '', duration: 30, mode: 'online' })
      fetchSlots()
    } catch (error) {
      console.error('Error creating slot:', error)
      setError(error.response?.data?.message || 'Failed to create slot')
    }
  }

  const handleMarkComplete = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/slots/${slotId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.message) {
        // Refresh both the slots list and completed interviews count
        fetchSlots()
        fetchCompletedInterviews()
        return response.data
      }
    } catch (error) {
      console.error('Error marking slot as complete:', error)
      throw error // Rethrow the error to be handled by the caller
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Interviewer Dashboard
          </h1>
          <div className="space-x-4">
            {/* <Button
              color="blue"
              onClick={() => navigate('/interviewer-profile')}
            >
              Edit Profile
            </Button> */}
            <Button color="green" onClick={() => navigate('/slot-management')}>
              Manage Slots
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Button disabled>
              <Spinner size="sm" className="me-3" />
              Loading...
            </Button>
          </div>
        ) : (
          <>
            {/* Slot Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Total Slots
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {slotStats.total}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Available Slots
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {slotStats.available}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Booked Slots
                </h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {slotStats.booked}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Completed Interviews
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {completedCount}
                </p>
              </div>
            </div>

            {/* Booked Slots Section */}
            {bookedSlots.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Upcoming Interviews
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookedSlots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      onMarkComplete={handleMarkComplete}
                      userRole="interviewer"
                      buttonComponent={Button}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 text-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Upcoming Interviews
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You don't have any booked interviews yet.
                </p>
                <Button
                  color="blue"
                  onClick={() => navigate('/slot-management')}
                >
                  Create More Slots
                </Button>
              </div>
            )}

            {profile && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Profile Details
                  </h2>
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => navigate('/interviewer-profile')}
                  >
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </p>
                    <p className="font-medium dark:text-white">
                      {profile.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current Occupation
                    </p>
                    <p className="font-medium dark:text-white">
                      {profile.current_occupation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Experience
                    </p>
                    <p className="font-medium dark:text-white">
                      {profile.experience} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expertise Level
                    </p>
                    <p className="font-medium capitalize dark:text-white">
                      {profile.expertise_level}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Location
                    </p>
                    <p className="font-medium dark:text-white">
                      {profile.location || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bio
                    </p>
                    <p className="font-medium dark:text-white">
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
                    {profile.certifications &&
                    profile.certifications.length > 0 ? (
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
          </>
        )}
      </div>
    </div>
  )
}

export default InterviewerDashboard
