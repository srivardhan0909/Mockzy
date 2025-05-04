// src/pages/AllSlots.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SlotCard from '../components/SlotCard'
import BookingModal from '../components/BookingModal'
import { fetchAllSlots, bookSlot, fetchSuggestions } from '../utils/api'
import { FaCalendarAlt, FaBookmark } from 'react-icons/fa'

const AllSlots = () => {
  const [slots, setSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [alternativeSlots, setAlternativeSlots] = useState([])
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userClassification, setUserClassification] = useState(null)
  const [searchDate, setSearchDate] = useState('')
  const [showNearestDates, setShowNearestDates] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [sortOrder, setSortOrder] = useState('none') // 'none', 'asc', 'desc'
  const navigate = useNavigate()

  // Create a hash map for efficient slot lookup by level
  const slotsByLevel = useMemo(() => {
    const levelMap = {
      beginner: [],
      moderate: [],
      expert: [],
      all: [],
    }

    slots.forEach((slot) => {
      const level = slot.expertise_level || 'all'
      levelMap[level].push(slot)
      levelMap.all.push(slot) // Add to 'all' category as well
    })

    return levelMap
  }, [slots])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchUserResume()
  }, [])

  const fetchUserResume = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const response = await axios.get(
        `http://localhost:3000/api/resumes/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setUserClassification(response.data.classification)
      fetchSlots(response.data.classification)
    } catch (error) {
      console.error('Error fetching user resume:', error)
      setError('Failed to fetch user resume information')
      setLoading(false)
    }
  }
  // console.log('User Classification:', userClassification)

  const fetchSlots = async (classification) => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:3000/api/slots',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { classification }, // Send classification to filter slots
        }
        // console.log('Slots:', response) // Log the fetched slots
      )

      // Validate and transform slot data
      // console.log('Fetched Slots:', response
      //   .data) // Log the fetched slots
      const validSlots = response.data.map((slot) => {
        return {
          ...slot,
          date: slot.date || new Date(),
          startTime: slot.startTime || '00:00',
          endTime: slot.endTime || '00:00',
          isBooked: slot.isBooked || false,
        }
      })

      setSlots(validSlots)
      setFilteredSlots(validSlots) // Initialize filteredSlots with all slots
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError('Failed to fetch slots')
    } finally {
      setLoading(false)
    }
  }

  const handleBookSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      // First check if the slot is still available
      const slotResponse = await axios.get(
        `http://localhost:3000/api/slots/${slotId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const slot = slotResponse.data
      if (slot.isBooked) {
        alert(
          'This slot has already been booked by another user. Please select a different slot.'
        )
        // Refresh the slots list to show updated availability
        fetchSlots(userClassification)
        return
      }

      // If slot is available, proceed with booking
      const response = await axios.post(
        'http://localhost:3000/api/slots/book',
        { slotId, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data) {
        // Update the slots list to reflect the booking
        setSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot._id === slotId
              ? { ...slot, bookedBy: userId, isBooked: true }
              : slot
          )
        )
        alert('Slot booked successfully!')
        // Refresh the slots list to show updated availability
        fetchSlots(userClassification)
      }
    } catch (error) {
      console.error('Error booking slot:', error)
      if (error.response) {
        if (error.response.status === 409) {
          alert(
            'This slot has already been booked by another user. Please select a different slot.'
          )
        } else if (error.response.status === 404) {
          alert('Slot not found. Please try again.')
        } else {
          alert('Failed to book slot. Please try again.')
        }
      } else {
        alert('Network error. Please check your connection and try again.')
      }
      // Refresh the slots list to show updated availability
      fetchSlots(userClassification)
    }
  }

  const handleAlternativeSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      await axios.post(
        'http://localhost:3000/api/slots/book',
        { slotId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Alternative slot booked successfully!')
      setShowAlternatives(false)
      fetchSlots(userClassification)
    } catch (error) {
      console.error('Error booking alternative slot:', error)
      alert('Failed to book alternative slot')
    }
  }

  // Handler when booking completes
  const handleBooked = (booking) => {
    alert(`Slot ${booking.slot_id} booked successfully!`)
    fetchSlots(userClassification)
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:3000/api/slots/${slotId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchSlots(userClassification)
    } catch (error) {
      console.error('Error deleting slot:', error)
      setError(error.response?.data?.message || 'Failed to delete slot')
    }
  }

  const findNearestDates = (targetDate, slots) => {
    const target = new Date(targetDate)
    const priorityQueue = []

    slots.forEach((slot) => {
      const slotDate = new Date(slot.date)
      const diffDays = Math.abs((slotDate - target) / (1000 * 60 * 60 * 24))
      priorityQueue.push({ slot, diffDays })
    })

    // Sort by difference in days
    priorityQueue.sort((a, b) => a.diffDays - b.diffDays)
    return priorityQueue.map((item) => item.slot)
  }

  const handleSearch = () => {
    if (!searchDate) {
      setFilteredSlots(slots) // Show all slots when search is cleared
      setShowNearestDates(false)
      return
    }

    const targetDate = new Date(searchDate)
    const exactMatches = slots.filter((slot) => {
      const slotDate = new Date(slot.date)
      return slotDate.toDateString() === targetDate.toDateString()
    })

    if (exactMatches.length > 0) {
      setFilteredSlots(exactMatches)
      setShowNearestDates(false)
    } else {
      const nearestSlots = findNearestDates(searchDate, slots)
      setFilteredSlots(nearestSlots)
      setShowNearestDates(true)
    }
  }

  const handleLevelSearch = (level) => {
    setSelectedLevel(level)
    if (level === 'all') {
      setFilteredSlots(slots)
    } else {
      setFilteredSlots(slotsByLevel[level])
    }
  }

  // Bucket sort implementation for slots by expertise level
  const bucketSortSlots = (slotsToSort, order = 'asc') => {
    // Define buckets for each expertise level
    const buckets = {
      beginner: [],
      moderate: [],
      expert: [],
    }

    // Distribute slots into buckets
    slotsToSort.forEach((slot) => {
      const level = slot.expertise_level || 'beginner'
      buckets[level].push(slot)
    })

    // Concatenate buckets based on sort order
    let sortedSlots = []
    if (order === 'asc') {
      sortedSlots = [
        ...buckets.beginner,
        ...buckets.moderate,
        ...buckets.expert,
      ]
    } else {
      sortedSlots = [
        ...buckets.expert,
        ...buckets.moderate,
        ...buckets.beginner,
      ]
    }

    return sortedSlots
  }

  const handleSort = (order) => {
    setSortOrder(order)
    if (order === 'none') {
      setFilteredSlots(slots)
    } else {
      const sortedSlots = bucketSortSlots(filteredSlots, order)
      setFilteredSlots(sortedSlots)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Interview Slots
          </h1>
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FaBookmark />
            <span>My Bookings</span>
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => {
                setSearchDate(e.target.value)
                if (!e.target.value) {
                  setFilteredSlots(slots) // Show all slots when search is cleared
                  setShowNearestDates(false)
                }
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Search Date
            </button>
            {searchDate && (
              <button
                onClick={() => {
                  setSearchDate('')
                  setFilteredSlots(slots)
                  setShowNearestDates(false)
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Clear Date
              </button>
            )}
          </div>

          {/* Level Filter Section */}
          <div className="flex gap-2 items-center">
            <span className="font-medium">Filter by Level:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleLevelSearch('all')}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  selectedLevel === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleLevelSearch('beginner')}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  selectedLevel === 'beginner'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => handleLevelSearch('moderate')}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  selectedLevel === 'moderate'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Moderate
              </button>
              <button
                onClick={() => handleLevelSearch('expert')}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  selectedLevel === 'expert'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Expert
              </button>
            </div>
          </div>

          {/* Sort Section */}
          <div className="flex gap-2 items-center">
            <span className="font-medium">Sort by Level:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('none')}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  sortOrder === 'none'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                None
              </button>
              <button
                onClick={() => handleSort('asc')}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  sortOrder === 'asc'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Beginner → Expert
              </button>
              <button
                onClick={() => handleSort('desc')}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  sortOrder === 'desc'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Expert → Beginner
              </button>
            </div>
          </div>
        </div>

        {showNearestDates && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              No slots found for the selected date. Showing nearest available
              dates.
            </p>
          </div>
        )}

        {userClassification && (
          <p className="text-lg mb-4">
            Your classification: {userClassification}
          </p>
        )}

        {!showAlternatives ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSlots.map((slot) => (
              <div key={slot.id} className="relative">
                <SlotCard
                  slot={slot}
                  onDelete={handleDeleteSlot}
                  userRole={localStorage.getItem('role')}
                  searchDate={searchDate}
                />
                {localStorage.getItem('role') === 'candidate' && (
                  <button
                    onClick={() => handleBookSlot(slot.id)}
                    className="absolute bottom-2 right-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Book Slot
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Alternative Slots Available
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alternativeSlots.map((slot) => (
                <div key={slot.id} className="relative">
                  <SlotCard
                    slot={slot}
                    onDelete={handleDeleteSlot}
                    userRole={localStorage.getItem('role')}
                  />
                  {localStorage.getItem('role') === 'candidate' && (
                    <button
                      onClick={() => handleAlternativeSlot(slot.id)}
                      className="absolute bottom-2 right-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Book Alternative Slot
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAlternatives(false)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to All Slots
            </button>
          </div>
        )}

        {selectedSlot && (
          <BookingModal
            slot={selectedSlot}
            userId={localStorage.getItem('userId')}
            onClose={() => setSelectedSlot(null)}
            onBooked={handleBooked}
          />
        )}
      </div>
    </div>
  )
}

export default AllSlots
