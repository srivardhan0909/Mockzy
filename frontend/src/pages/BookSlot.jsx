import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button, Spinner } from 'flowbite-react'
import { API_BASE } from '../utils/api'

const BookSlot = () => {
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [alternativeSlots, setAlternativeSlots] = useState([])
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('success')
  const [popupTitle, setPopupTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE}/slots`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSlots(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching slots:', error)
      showPopupMessage('Error', 'Failed to fetch slots', 'error')
      setLoading(false)
    }
  }

  const showPopupMessage = (title, message, type) => {
    setPopupTitle(title)
    setPopupMessage(message)
    setPopupType(type)
    setShowPopup(true)
    setTimeout(() => {
      setShowPopup(false)
    }, 3000)
  }

  const handleBookSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const response = await axios.post(
        `${API_BASE}/slots/book`,
        { slotId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.conflict) {
        setAlternativeSlots(response.data.alternativeSlots)
        setShowAlternatives(true)
        showPopupMessage(
          'Time Conflict',
          'You already have a booking for this date. Here are some alternatives.',
          'error'
        )
      } else {
        showPopupMessage('Success', 'Slot booked successfully!', 'success')
        fetchSlots()
      }
    } catch (error) {
      console.error('Error booking slot:', error)
      showPopupMessage(
        'Error',
        error.response?.data?.message || 'Failed to book slot',
        'error'
      )
    }
  }

  const handleAlternativeSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      await axios.post(
        `${API_BASE}/slots/book`,
        { slotId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showPopupMessage(
        'Success',
        'Alternative slot booked successfully!',
        'success'
      )
      setShowAlternatives(false)
      fetchSlots()
    } catch (error) {
      console.error('Error booking alternative slot:', error)
      showPopupMessage('Error', 'Failed to book alternative slot', 'error')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Slots</h1>

      {/* Enhanced Popup Message */}
      <div
        className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out transform ${
          showPopup ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div
          className={`flex items-center p-4 mb-4 rounded-lg shadow-lg ${
            popupType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex-shrink-0">
            {popupType === 'success' ? (
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">{popupTitle}</h3>
            <div className="text-sm">{popupMessage}</div>
          </div>
          <Button
            size="xs"
            color="light"
            pill
            onClick={() => setShowPopup(false)}
            className="ml-auto"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Show loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Button disabled>
            <Spinner size="sm" className="me-3" />
            Loading...
          </Button>
        </div>
      ) : !showAlternatives ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div key={slot.id} className="border rounded-lg p-4 shadow-md bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-2">Slot {slot.id}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Date: {new Date(slot.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Time: {slot.startTime} - {slot.endTime}
              </p>
              <Button
                gradientDuoTone="cyanToBlue"
                className="mt-4 w-full"
                onClick={() => handleBookSlot(slot.id)}
              >
                Book Slot
              </Button>
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
              <div key={slot.id} className="border rounded-lg p-4 shadow-md bg-white dark:bg-gray-800">
                <h3 className="text-xl font-semibold mb-2">Slot {slot.id}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Date: {new Date(slot.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Time: {slot.startTime} - {slot.endTime}
                </p>
                <Button
                  gradientDuoTone="greenToBlue"
                  className="mt-4 w-full"
                  onClick={() => handleAlternativeSlot(slot.id)}
                >
                  Book Alternative Slot
                </Button>
              </div>
            ))}
          </div>
          <Button
            color="light"
            onClick={() => setShowAlternatives(false)}
            className="mt-4"
          >
            Back to All Slots
          </Button>
        </div>
      )}
    </div>
  )
}

export default BookSlot
