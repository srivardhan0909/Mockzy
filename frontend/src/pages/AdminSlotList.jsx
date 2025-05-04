// src/pages/AdminSlotList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminSlotList = () => {
  const [slots, setSlots] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  const formatDateTime = (dateStr, timeStr, duration) => {
    const start = new Date(`${dateStr}T${timeStr}`);
    const end = new Date(start.getTime() + duration * 60000);
    return {
      startFormatted: start.toLocaleString(),
      endFormatted: end.toLocaleString(),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/slots/conflicts');
        setSlots(res.data.slots);
        setConflicts(res.data.conflicts);
      } catch (err) {
        console.error('Error fetching slots:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Slots</h2>
      <div className="grid gap-4">
        {slots.map((slot, index) => {
          const { startFormatted, endFormatted } = formatDateTime(slot.date, slot.time, slot.duration);
          return (
            <div
              key={index}
              className="border p-4 rounded shadow-md bg-white"
            >
              <p><strong>Slot ID:</strong> {slot.id}</p>
              <p><strong>Admin ID:</strong> {slot.admin_id}</p>
              <p><strong>Date:</strong> {slot.date}</p>
              <p><strong>Start:</strong> {startFormatted}</p>
              <p><strong>End:</strong> {endFormatted}</p>
              <p><strong>Mode:</strong> {slot.mode}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Conflicting Slots</h2>
      {conflicts.length === 0 ? (
        <p className="text-green-600">No conflicts found.</p>
      ) : (
        <div className="space-y-4">
          {conflicts.map((pair, idx) => (
            <div key={idx} className="bg-red-100 p-4 rounded">
              <p className="font-semibold">Conflict {idx + 1}:</p>
              <div className="grid grid-cols-2 gap-4">
                {[pair.slotA, pair.slotB].map((slot, sidx) => {
                  const { startFormatted, endFormatted } = formatDateTime(slot.date, slot.time, slot.duration);
                  return (
                    <div key={sidx} className="border p-2 rounded bg-white">
                      <p><strong>ID:</strong> {slot.id}</p>
                      <p><strong>Admin:</strong> {slot.admin_id}</p>
                      <p><strong>Start:</strong> {startFormatted}</p>
                      <p><strong>End:</strong> {endFormatted}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSlotList;
