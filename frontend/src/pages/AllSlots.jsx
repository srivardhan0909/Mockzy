// src/pages/AllSlots.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SlotCard from '../components/SlotCard'
import BookingModal from '../components/BookingModal'
import { fetchAllSlots, bookSlot, fetchSuggestions, API_BASE } from '../utils/api'
import {
  FaCalendarAlt,
  FaBookmark,
  FaSearch,
  FaCalendarCheck,
  FaLock,
  FaExchangeAlt,
  FaArrowLeft,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Button, Spinner } from 'flowbite-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const AllSlots = () => {
  const [slots, setSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [alternativeSlots, setAlternativeSlots] = useState([])
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userClassification, setUserClassification] = useState(null)
  const [searchDate, setSearchDate] = useState(null)
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
        `${API_BASE}/resumes/user/${userId}`,
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
        `${API_BASE}/slots`,
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
        `${API_BASE}/slots/${slotId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const slot = slotResponse.data
      if (slot.isBooked) {
        toast.warning(
          'This slot has already been booked by another user. Please select a different slot.'
        )
        // Refresh the slots list to show updated availability
        fetchSlots(userClassification)
        return
      }

      // If slot is available, proceed with booking
      const response = await axios.post(
        `${API_BASE}/slots/book`,
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
        toast.success('Slot booked successfully!')
        // Refresh the slots list to show updated availability
        fetchSlots(userClassification)
      }
    } catch (error) {
      console.error('Error booking slot:', error)
      if (error.response) {
        if (error.response.status === 409) {
          // Handle conflict - user already has a booking for this date
          const conflictData = error.response.data
          setAlternativeSlots(conflictData.alternativeSlots || [])
          setShowAlternatives(true)
          toast.info(
            'You already have a booking on this date. Here are some alternative slots you can book instead.'
          )
        } else if (error.response.status === 404) {
          toast.error('Slot not found. Please try again.')
        } else {
          toast.error('Failed to book slot. Please try again.')
        }
      } else {
        toast.error(
          'Network error. Please check your connection and try again.'
        )
      }
      // Refresh the slots list to show updated availability
      fetchSlots(userClassification)
    }
  }

  const handleAlternativeSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const response = await axios.post(
        `${API_BASE}/slots/book`,
        { slotId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data) {
        toast.success('Alternative slot booked successfully!')
        setShowAlternatives(false)
        fetchSlots(userClassification)
      }
    } catch (error) {
      console.error('Error booking alternative slot:', error)
      if (error.response) {
        if (error.response.status === 409) {
          // Even the alternative has a conflict
          toast.warning(
            'You already have a booking that conflicts with this alternative slot. Please select a different date or time.'
          )
        } else if (error.response.status === 404) {
          toast.error(
            'Slot not found. It may have been booked by someone else. Please try again.'
          )
        } else {
          toast.error('Failed to book alternative slot. Please try again.')
        }
      } else {
        toast.error(
          'Network error. Please check your connection and try again.'
        )
      }
      // Refresh to show updated slot availability
      fetchSlots(userClassification)
    }
  }

  // Handler when booking completes
  const handleBooked = (booking) => {
    toast.success(`Slot ${booking.slot_id} booked successfully!`)
    fetchSlots(userClassification)
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE}/slots/${slotId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchSlots(userClassification)
    } catch (error) {
      console.error('Error deleting slot:', error)
      setError(error.response?.data?.message || 'Failed to delete slot')
    }
  }

  // Fix findNearestDates to better handle nearest date search
  const findNearestDates = (targetDate, slots) => {
    // Ensure we have a valid Date object
    const target =
      targetDate instanceof Date ? targetDate : new Date(targetDate)

    // Check for valid date
    if (isNaN(target.getTime())) {
      console.error('Invalid target date provided to findNearestDates')
      return slots // Return all slots if the target date is invalid
    }

    // Set start of day for target date (remove time component)
    const targetStartOfDay = new Date(target)
    targetStartOfDay.setHours(0, 0, 0, 0)

    console.log('Finding nearest dates to:', targetStartOfDay)

    const priorityQueue = []

    slots.forEach((slot) => {
      try {
        if (!slot.date) {
          console.warn('Slot missing date:', slot)
          return // Skip this slot
        }

        // Create a new date object and set to start of day
        const slotDate = new Date(slot.date)
        slotDate.setHours(0, 0, 0, 0)

        // Calculate difference in milliseconds and convert to days
        const diffMs = Math.abs(slotDate.getTime() - targetStartOfDay.getTime())
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

        console.log(`Slot date: ${slotDate}, diff: ${diffDays} days`)

        priorityQueue.push({
          slot,
          diffDays,
          // Add formatted date for debugging
          slotDateStr: slotDate.toLocaleDateString(),
        })
      } catch (error) {
        console.error('Error processing slot date:', error, slot)
        // Skip this slot if there's an error
      }
    })

    // Sort by difference in days
    priorityQueue.sort((a, b) => a.diffDays - b.diffDays)

    // Log the priority queue for debugging
    console.log(
      'Priority queue (first 5):',
      priorityQueue.slice(0, 5).map((item) => ({
        id: item.slot.id,
        date: item.slotDateStr,
        diffDays: item.diffDays,
      }))
    )

    // Return the sorted slots
    return priorityQueue.map((item) => item.slot)
  }

  const handleSearch = () => {
    if (!searchDate) {
      setFilteredSlots(slots) // Show all slots when search is cleared
      setShowNearestDates(false)
      return
    }

    // Ensure we have a Date object
    const targetDate =
      searchDate instanceof Date ? searchDate : new Date(searchDate)

    // Check for valid date
    if (isNaN(targetDate.getTime())) {
      toast.error('Invalid date selected')
      return
    }

    console.log('Searching for date:', targetDate)
    console.log('Total slots available:', slots.length)

    // Set start of day for comparison (remove time component)
    const targetStartOfDay = new Date(targetDate)
    targetStartOfDay.setHours(0, 0, 0, 0)

    const exactMatches = slots.filter((slot) => {
      // Ensure slot.date is a valid date
      if (!slot.date) return false

      const slotDate = new Date(slot.date)
      slotDate.setHours(0, 0, 0, 0)

      // Direct timestamp comparison
      return slotDate.getTime() === targetStartOfDay.getTime()
    })

    console.log('Exact matches found:', exactMatches.length)

    if (exactMatches.length > 0) {
      setFilteredSlots(exactMatches)
      setShowNearestDates(false)
    } else {
      // Find nearest slots when no exact matches
      const nearestSlots = findNearestDates(targetDate, slots)
      console.log('Nearest slots found:', nearestSlots.length)

      if (nearestSlots.length > 0) {
        setFilteredSlots(nearestSlots)
        setShowNearestDates(true)
      } else {
        // No slots found at all
        setFilteredSlots([])
        toast.info('No available slots found near the selected date')
      }
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
      <div className="flex items-center justify-center min-h-screen">
        <Button disabled className="py-2.5 px-5">
          <Spinner size="sm" className="me-3" />
          Loading...
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-4 text-center text-red-500 border border-red-200 rounded-lg bg-red-50">
          <p className="mb-1 font-medium">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50 sm:py-12">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Available Interview Slots
          </h1>
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md btn-pulse"
          >
            <FaBookmark />
            <span>My Bookings</span>
          </button>
        </div>

        {/* Search Section */}
        <div className="p-5 mb-8 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex flex-col items-start w-full gap-4 sm:flex-row sm:items-center md:w-auto">
              <div className="relative w-full sm:w-56">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
                  <FaCalendarAlt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <DatePicker
                  selected={searchDate}
                  onChange={(date) => {
                    console.log('Date selected:', date)
                    setSearchDate(date)

                    if (!date) {
                      setFilteredSlots(slots)
                      setShowNearestDates(false)
                    } else {
                      // Automatically search when a date is selected
                      const targetDate = new Date(date)
                      targetDate.setHours(0, 0, 0, 0)

                      console.log('Normalized date:', targetDate)

                      const exactMatches = slots.filter((slot) => {
                        if (!slot.date) return false

                        const slotDate = new Date(slot.date)
                        slotDate.setHours(0, 0, 0, 0)

                        return slotDate.getTime() === targetDate.getTime()
                      })

                      if (exactMatches.length > 0) {
                        setFilteredSlots(exactMatches)
                        setShowNearestDates(false)
                      } else {
                        const nearestSlots = findNearestDates(date, slots)

                        if (nearestSlots.length > 0) {
                          setFilteredSlots(nearestSlots)
                          setShowNearestDates(true)
                        } else {
                          setFilteredSlots([])
                          toast.info(
                            'No available slots found near the selected date'
                          )
                        }
                      }
                    }
                  }}
                  className="ps-10 py-2.5 px-4 w-full border border-gray-300 rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-sm"
                  placeholderText="Select date"
                  dateFormat="MM/dd/yyyy"
                  isClearable
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={10}
                />
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  gradientDuoTone="cyanToBlue"
                  onClick={handleSearch}
                  size="sm"
                  className="w-1/2 transition-all duration-200 shadow-sm sm:w-auto hover:shadow-md"
                >
                  <FaSearch className="mr-2" /> Search
                </Button>
                {searchDate && (
                  <Button
                    color="light"
                    onClick={() => {
                      setSearchDate(null)
                      setFilteredSlots(slots)
                      setShowNearestDates(false)
                    }}
                    size="sm"
                    className="w-1/2 sm:w-auto"
                  >
                    Clear Date
                  </Button>
                )}
              </div>
            </div>

            {/* Level Filter Section */}
            <div className="flex flex-wrap items-center w-full gap-2 md:w-auto">
              <span className="w-full font-medium text-gray-700 md:w-auto">
                Filter by Level:
              </span>
              <div className="flex flex-wrap w-full gap-2 md:w-auto">
                <Button
                  color={selectedLevel === 'all' ? 'blue' : 'light'}
                  onClick={() => handleLevelSearch('all')}
                  size="sm"
                  className="transition-all duration-200"
                >
                  All
                </Button>
                <Button
                  color={selectedLevel === 'beginner' ? 'blue' : 'light'}
                  onClick={() => handleLevelSearch('beginner')}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Beginner
                </Button>
                <Button
                  color={selectedLevel === 'moderate' ? 'blue' : 'light'}
                  onClick={() => handleLevelSearch('moderate')}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Moderate
                </Button>
                <Button
                  color={selectedLevel === 'expert' ? 'blue' : 'light'}
                  onClick={() => handleLevelSearch('expert')}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Expert
                </Button>
              </div>
            </div>

            {/* Sort Section */}
            <div className="flex flex-wrap items-center w-full gap-2 md:w-auto">
              <span className="w-full font-medium text-gray-700 md:w-auto">
                Sort by Level:
              </span>
              <div className="flex flex-wrap w-full gap-2 md:w-auto">
                <Button
                  color={sortOrder === 'none' ? 'blue' : 'light'}
                  onClick={() => handleSort('none')}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Default
                </Button>
                <Button
                  color={sortOrder === 'asc' ? 'blue' : 'light'}
                  onClick={() => handleSort('asc')}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Ascending
                </Button>
                <Button
                  color={sortOrder === 'desc' ? 'blue' : 'light'}
                  onClick={() => handleSort('desc')}
                  size="sm"
                  className="transition-all duration-200"
                >
                  Descending
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showNearestDates && (
          <div className="w-full p-4 mb-6 border border-yellow-200 rounded-lg shadow-sm bg-yellow-50">
            <p className="flex items-center text-yellow-800">
              <FaCalendarAlt className="mr-2 text-yellow-600" />
              No exact slots found for{' '}
              {searchDate instanceof Date && !isNaN(searchDate.getTime())
                ? searchDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'the selected date'}
              {'. '}
              Showing nearest available dates by proximity.
            </p>
          </div>
        )}

        {filteredSlots.length === 0 && (
          <div className="w-full p-6 mb-6 border border-blue-200 rounded-lg shadow-sm bg-blue-50">
            <p className="flex flex-col items-center justify-center text-blue-800">
              <FaCalendarAlt className="mb-2 text-2xl text-blue-600" />
              <span className="font-medium">No slots available</span>
              <span className="mt-1 text-sm">
                Try selecting a different date or clearing filters.
              </span>
            </p>
          </div>
        )}

        {userClassification && (
          <div className="p-4 mb-6 border border-indigo-100 rounded-lg shadow-sm bg-indigo-50">
            <p className="flex items-center text-lg">
              <span className="mr-2 font-medium text-indigo-800">
                Your classification:
              </span>
              <span className="text-indigo-700">{userClassification}</span>
            </p>
          </div>
        )}

        {!showAlternatives ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className="relative transition-all duration-300"
              >
                <SlotCard
                  slot={slot}
                  onDelete={handleDeleteSlot}
                  userRole={localStorage.getItem('role')}
                  searchDate={searchDate}
                />
                {localStorage.getItem('role') === 'candidate' && (
                  <div className="mt-4">
                    {slot.isBooked ? (
                      <Button color="light" disabled className="w-full">
                        <span className="flex items-center justify-center">
                          <FaLock className="mr-2" /> Already Booked
                        </span>
                      </Button>
                    ) : (
                      <Button
                        gradientDuoTone="cyanToBlue"
                        onClick={() => handleBookSlot(slot.id)}
                        className="w-full transition-all duration-300 btn-pulse"
                      >
                        <span className="flex items-center justify-center">
                          <FaCalendarCheck className="mr-2" /> Book Slot
                        </span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="flex items-center mb-6 text-2xl font-bold text-blue-700">
              <FaExchangeAlt className="mr-2" />
              Alternative Slots Available
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {alternativeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="relative transition-all duration-300 card-soft-shadow"
                >
                  <SlotCard
                    slot={slot}
                    onDelete={handleDeleteSlot}
                    userRole={localStorage.getItem('role')}
                  />
                  {localStorage.getItem('role') === 'candidate' && (
                    <div className="mt-4">
                      <Button
                        gradientDuoTone="greenToBlue"
                        className="w-full transition-all duration-300 btn-pulse"
                        onClick={() => handleAlternativeSlot(slot.id)}
                      >
                        <span className="flex items-center justify-center">
                          <FaExchangeAlt className="mr-2" /> Book Alternative
                          Slot
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              color="light"
              onClick={() => setShowAlternatives(false)}
              className="mt-6 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="flex items-center">
                <FaArrowLeft className="mr-2" /> Back to All Slots
              </span>
            </Button>
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
