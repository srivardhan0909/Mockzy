import { motion } from 'framer-motion'
import { FaClock, FaCalendarAlt, FaUser, FaTrash, FaStar } from 'react-icons/fa'

const SlotCard = ({ slot, onDelete, userRole, searchDate }) => {
  if (!slot || !slot.date) {
    return null // Return null if slot data is invalid
  }

  //   console.log('Slot:', slot)  ;

  const start = new Date(slot.date)
  const end = new Date(slot.date)

  // Safely handle time splitting with default values
  const startTime = slot.time || '00:00'
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const duration = slot.duration || 0 // duration in minutes
  const endHour =
    Math.floor((startHour * 60 + startMinute + duration) / 60) % 24
  const endMinute = (startMinute + duration) % 60
  const endTime = `${String(endHour).padStart(2, '0')}:${String(
    endMinute
  ).padStart(2, '0')}`

  //   console.log('Slot:', startTime + ' ' + endTime)  ;
  const [startHours, startMinutes] = startTime.split(':')
  const [endHours, endMinutes] = endTime.split(':')

  start.setHours(parseInt(startHours) || 0, parseInt(startMinutes) || 0)
  end.setHours(parseInt(endHours) || 0, parseInt(endMinutes) || 0)

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

  const getDateDifference = () => {
    if (!searchDate) return null
    const targetDate = new Date(searchDate)
    const slotDate = new Date(slot.date)
    const diffTime = Math.abs(slotDate - targetDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        await onDelete(slot.id)
      } catch (error) {
        console.error('Error deleting slot:', error)
      }
    }
  }

  const getExpertiseLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'expert':
        return 'text-yellow-500'
      case 'moderate':
        return 'text-blue-500'
      case 'beginner':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  // console.log(slot)
  const dateDifference = getDateDifference()

  return (
    <motion.div
      className={`rounded-xl shadow-md p-4 m-2 w-full max-w-md 
                ${slot.is_booked ? 'bg-red-100' : 'bg-green-100'} 
                border-l-4 ${
                  slot.is_booked ? 'border-red-500' : 'border-green-500'
                }
            `}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start">
        <div className="font-semibold text-xl mb-1 flex items-center gap-2">
          <FaCalendarAlt /> {start.toDateString()}
          {dateDifference !== null && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {dateDifference === 0
                ? 'Today'
                : `${dateDifference} days ${
                    dateDifference > 0 ? 'after' : 'before'
                  }`}
            </span>
          )}
        </div>
        {!slot.is_booked && userRole !== 'candidate' && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Delete slot"
          >
            <FaTrash />
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700 flex items-center gap-2">
        <FaClock />
        {formatTime(start)} → {formatTime(end)}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <FaUser />
        <span className="font-medium">Interviewer:</span>{' '}
        {slot.interviewer_name || 'Not assigned'}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <FaStar className={getExpertiseLevelColor(slot.expertise_level)} />
        <span className="font-medium">Level:</span>{' '}
        <span className={getExpertiseLevelColor(slot.expertise_level)}>
          {slot.expertise_level || 'Not specified'}
        </span>
      </div>
      <div className="mt-2">
        <span className="font-medium">Mode:</span>{' '}
        {slot.mode || 'Not specified'}
      </div>
      <div className="mt-2">
        <span className="font-medium">Status:</span>{' '}
        {slot.is_booked ? 'Booked' : 'Available'}
      </div>
    </motion.div>
  )
}

export default SlotCard
