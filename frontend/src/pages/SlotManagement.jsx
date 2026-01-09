import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import SlotCard from '../components/SlotCard'
import { toast } from 'react-toastify'
import { Button, Spinner } from 'flowbite-react'
import { API_BASE } from '../utils/api'

const SlotManagement = () => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    duration: 30,
    mode: 'online',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'interviewer') {
      navigate('/login')
      return
    }
    fetchSlots()
  }, [navigate])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE}/slots/my-slots`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSlots(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching slots:', error)
      toast.error('Failed to fetch slots')
      setLoading(false)
    }
  }

  const handleCreateSlot = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE}/slots`, newSlot, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Slot created successfully!')
      setNewSlot({ date: '', time: '', duration: 30, mode: 'online' })
      fetchSlots()
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error creating slot:', error)
      toast.error(error.response?.data?.message || 'Failed to create slot')
      setIsSubmitting(false)
    }
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(
        `${API_BASE}/slots/${slotId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.message) {
        toast.success('Slot deleted successfully!')
        // Refresh the slots list after successful deletion
        fetchSlots()
      }
    } catch (error) {
      console.error('Error deleting slot:', error)
      // Show specific error message from the backend
      toast.error(error.response?.data?.message || 'Failed to delete slot')
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
        // Refresh the slots list
        fetchSlots()
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
            Slot Management
          </h1>
          <Button
            color="blue"
            onClick={() => navigate('/interviewer-dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Create New Slot Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Create New Slot
          </h2>
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, date: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <input
                  type="time"
                  value={newSlot.time}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, time: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newSlot.duration}
                  onChange={(e) =>
                    setNewSlot({
                      ...newSlot,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min="15"
                  step="15"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mode
                </label>
                <select
                  value={newSlot.mode}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, mode: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <Button
              type="submit"
              color="blue"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-3" />
                  Creating...
                </>
              ) : (
                'Create Slot'
              )}
            </Button>
          </form>
        </div>

        {/* Slots List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            My Slots
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Button disabled>
                <Spinner size="sm" className="me-3" />
                Loading...
              </Button>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't created any slots yet.
              </p>
              <Button
                color="blue"
                onClick={() =>
                  document
                    .querySelector('form')
                    .scrollIntoView({ behavior: 'smooth' })
                }
              >
                Create Your First Slot
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onDelete={handleDeleteSlot}
                  onMarkComplete={handleMarkComplete}
                  buttonComponent={Button}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SlotManagement
