import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import SlotCard from '../components/SlotCard'

const SlotManagement = () => {
  const [slots, setSlots] = useState([])
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    duration: 30,
    mode: 'online',
  })
  const [error, setError] = useState('')
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
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:3000/api/slots/my-slots',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSlots(response.data)
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

  const handleDeleteSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(
        `http://localhost:3000/api/slots/${slotId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.message) {
        // Show success message
        setError('')
        // Refresh the slots list after successful deletion
        fetchSlots()
      }
    } catch (error) {
      console.error('Error deleting slot:', error)
      // Show specific error message from the backend
      setError(error.response?.data?.message || 'Failed to delete slot')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Slot Management</h1>
          <button
            onClick={() => navigate('/interviewer-dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Create New Slot Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Slot</h2>
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, date: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  value={newSlot.time}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, time: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mode
                </label>
                <select
                  value={newSlot.mode}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, mode: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Slot
            </button>
          </form>
        </div>

        {/* Slots List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Slots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <SlotCard key={slot.id} slot={slot} onDelete={handleDeleteSlot} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SlotManagement
