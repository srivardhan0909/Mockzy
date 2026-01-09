// src/utils/api.js
import axios from 'axios';

// Central API base URL - uses environment variable in production
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_BASE,
});

export const fetchAllSlots = async () => {
  const res = await api.get('/slots');
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
