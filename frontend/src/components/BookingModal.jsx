// src/components/BookingModal.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchSuggestions, bookSlot } from '../utils/api';
import { FaTimes } from 'react-icons/fa';

const BookingModal = ({ slot, userId, onClose, onBooked }) => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Attempt to book the slot
  const handleBook = async (selectedSlotId) => {
    setLoading(true);
    setError('');
    try {
      const res = await bookSlot({ slot_id: selectedSlotId, user_id: userId });
      onBooked(res.booking);
      onClose();
    } catch (err) {
      // If conflict: fetch suggestions
      if (err.response?.data?.message === 'Slot already booked') {
        fetchAlternativeSuggestions(slot.id);
      } else {
        setError(err.response?.data?.message || 'Booking failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch alternative suggestions
  const fetchAlternativeSuggestions = async (slotId) => {
    try {
      const res = await fetchSuggestions(slotId);
      setSuggestions(res.suggestions);
    } catch {
      setError('Failed to fetch alternatives');
    }
  };

  useEffect(() => {
    // No-op
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-xl w-full max-w-lg relative"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600">
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold mb-4">Book Slot #{slot.id}</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          disabled={isLoading}
          onClick={() => handleBook(slot.id)}
          className="w-full bg-blue-500 text-white py-2 rounded mb-4 disabled:opacity-50"
        >
          {isLoading ? 'Booking...' : 'Confirm Booking'}
        </button>

        {suggestions.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Alternative Slots:</h3>
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li key={s.id} className="border p-2 rounded flex justify-between">
                  <span>Slot #{s.id} — {new Date(s.date).toLocaleDateString()} {new Date(`${s.date}T${s.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  <button
                    onClick={() => handleBook(s.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Book
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;
