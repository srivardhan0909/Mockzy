// src/utils/api.js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const fetchAllSlots = async () => {
  const res = await axios.get(`${API_BASE}/slots`);
  return res.data;
};

// Book a slot
export const bookSlot = async ({ slot_id, user_id }) => {
  const res = await axios.post(`${API_BASE}/bookings`, { slot_id, user_id });
  return res.data;
};

// Fetch alternative slot suggestions
export const fetchSuggestions = async (slotId, limit = 3) => {
  const res = await axios.get(`${API_BASE}/bookings/suggest/${slotId}?limit=${limit}`);
  return res.data;
};
