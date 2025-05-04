import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FaCalendarAlt, FaClock, FaUserTie, FaTrash } from 'react-icons/fa'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stack implementation for managing bookings
  const [bookingStack, setBookingStack] = useState([])

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      // Fetch all slots and filter for user's bookings
      const response = await axios.get('http://localhost:3000/api/slots', {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Filter slots that are booked by the current user
      const bookedSlots = response.data.filter(
        (slot) => slot.bookedBy === userId || slot.userId === userId
      )

      const sortedBookings = bookedSlots
        .map((slot) => ({
          _id: slot._id,
          slot: {
            ...slot,
            date: slot.date || new Date(),
            startTime: slot.startTime || '00:00',
            endTime: slot.endTime || '00:00',
            interviewer: {
              name: slot.interviewerName || 'Unknown Interviewer',
            },
          },
        }))
        .sort((a, b) => new Date(b.slot.date) - new Date(a.slot.date))

      setBookings(sortedBookings)
      setBookingStack(sortedBookings)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Failed to fetch bookings')
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:3000/api/slots/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Remove booking from stack
      setBookingStack((prevStack) =>
        prevStack.filter((booking) => booking._id !== bookingId)
      )
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      )
    } catch (error) {
      console.error('Error canceling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            My Booked Interviews
          </h1>

          {bookingStack.length === 0 ? (
            <motion.div className="text-center py-12" variants={itemVariants}>
              <p className="text-gray-600 text-lg">
                You haven't booked any interviews yet.
              </p>
              <p className="text-gray-500 mt-2">
                Book your first interview from the available slots!
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {bookingStack.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                  style={{
                    zIndex: bookingStack.length - index,
                    transform: `translateY(${index * 2}px)`,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-blue-500" />
                        <span className="font-medium">
                          {new Date(booking.slot.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-blue-500" />
                        <span className="font-medium">
                          {booking.slot.startTime} - {booking.slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUserTie className="text-blue-500" />
                        <span className="font-medium">
                          Interviewer: {booking.slot.interviewer.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor:
                              booking.slot.expertise_level === 'beginner'
                                ? '#DCFCE7'
                                : booking.slot.expertise_level === 'moderate'
                                ? '#FEF3C7'
                                : '#FEE2E2',
                            color:
                              booking.slot.expertise_level === 'beginner'
                                ? '#166534'
                                : booking.slot.expertise_level === 'moderate'
                                ? '#92400E'
                                : '#991B1B',
                          }}
                        >
                          {booking.slot.expertise_level
                            .charAt(0)
                            .toUpperCase() +
                            booking.slot.expertise_level.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                      <motion.button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTrash />
                        <span>Cancel Booking</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default MyBookings
