// src/components/BookingModal.jsx
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchSuggestions, bookSlot } from '../utils/api'
import {
  FaTimes,
  FaCalendarCheck,
  FaExchangeAlt,
  FaClock,
  FaCalendarAlt,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Spinner } from 'flowbite-react'

const BookingModal = ({ slot, userId, onClose, onBooked }) => {
  const [isLoading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [bookingSlotId, setBookingSlotId] = useState(null)

  // Format the date and time
  const formattedDate = slot?.date
    ? new Date(slot.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const formattedTime = slot?.time
    ? new Date(`2023-01-01T${slot.time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : ''

  // Attempt to book the slot
  const handleBook = async (selectedSlotId) => {
    setLoading(true)
    setBookingSlotId(selectedSlotId)
    try {
      const res = await bookSlot({ slot_id: selectedSlotId, user_id: userId })
      toast.success('🎉 Slot booked successfully!')
      onBooked(res.booking)
      onClose()
    } catch (err) {
      // If conflict: fetch suggestions
      if (err.response?.data?.message === 'Slot already booked') {
        toast.info('This slot is already booked. Showing alternative options.')
        fetchAlternativeSuggestions(slot.id)
      } else {
        toast.error(err.response?.data?.message || 'Booking failed')
      }
    } finally {
      setLoading(false)
      setBookingSlotId(null)
    }
  }

  // Fetch alternative suggestions
  const fetchAlternativeSuggestions = async (slotId) => {
    try {
      const res = await fetchSuggestions(slotId)
      setSuggestions(res.suggestions)
    } catch {
      toast.error('Failed to fetch alternative slots')
    }
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-lg relative shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
          aria-label="Close modal"
        >
          <FaTimes className="text-lg" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1 text-gray-800">
            Book Interview Slot
          </h2>
          <p className="text-gray-600">Confirm your booking details below</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <div className="flex items-center mb-3 text-blue-800">
            <FaCalendarAlt className="text-blue-600 mr-2" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center text-blue-800">
            <FaClock className="text-blue-600 mr-2" />
            <span className="font-medium">{formattedTime}</span>
          </div>
          {slot?.expertise_level && (
            <div className="mt-2 inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-medium">
              {slot.expertise_level.charAt(0).toUpperCase() +
                slot.expertise_level.slice(1)}{' '}
              Level
            </div>
          )}
        </div>

        <button
          disabled={isLoading}
          onClick={() => handleBook(slot.id)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg mb-4 disabled:opacity-70 transition-all duration-200 font-medium shadow-md hover:shadow-lg btn-pulse"
        >
          {isLoading && bookingSlotId === slot.id ? (
            <span className="flex items-center justify-center">
              <Spinner size="sm" className="mr-3" light={true} />
              Booking...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <FaCalendarCheck className="mr-2" />
              Confirm Booking
            </span>
          )}
        </button>

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-200 pt-5 mt-2">
                <h3 className="font-semibold mb-3 flex items-center text-gray-800">
                  <FaExchangeAlt className="text-indigo-600 mr-2" />
                  Alternative Slots
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {suggestions.map((s) => (
                    <motion.div
                      key={s.id}
                      className="border border-gray-200 p-3 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all duration-200 bg-white"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">
                            {new Date(s.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(
                              `2023-01-01T${s.time}`
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => handleBook(s.id)}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-70"
                        >
                          {isLoading && bookingSlotId === s.id ? (
                            <Spinner size="sm" light={true} />
                          ) : (
                            'Book'
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default BookingModal
