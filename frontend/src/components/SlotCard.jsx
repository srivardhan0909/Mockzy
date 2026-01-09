import { useState } from 'react'
import { Card, Badge, Button, Tooltip } from 'flowbite-react'
import { Tag, Space, Modal } from 'antd'
import {
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { toast } from 'react-toastify'
import {
  HiClock,
  HiCalendar,
  HiUser,
  HiAcademicCap,
  HiVideoCamera,
} from 'react-icons/hi'

const SlotCard = ({ slot, onDelete, onMarkComplete, userRole, searchDate }) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)

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

    // Calculate the difference in milliseconds
    const diffTime = slotDate - targetDate

    // Convert to days and get the absolute value for display
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24))

    // Return an object with both the difference and whether it's before or after
    return {
      days: diffDays,
      isBefore: diffTime < 0, // true if slot date is before search date
      isAfter: diffTime > 0, // true if slot date is after search date
      isSame: diffTime === 0, // true if dates are the same
    }
  }

  const handleDelete = async () => {
    setConfirmModalVisible(true)
  }

  const confirmDelete = async () => {
    try {
      await onDelete(slot.id)
      setConfirmModalVisible(false)
    } catch (error) {
      console.error('Error deleting slot:', error)
      toast.error('Failed to delete slot')
    }
  }

  const handleMarkComplete = () => {
    // Create a custom confirm toast
    const toastId = toast(
      <div className="confirmation-toast">
        <div className="mb-3 font-medium">Mark interview as complete?</div>
        <p className="mb-4 text-sm text-gray-600">
          This will remove the interview from your list.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              toast.dismiss(toastId)
              toast.info('Action canceled')
            }}
            className="flex items-center px-3 py-1 text-gray-800 transition-colors bg-gray-200 rounded hover:bg-gray-300"
          >
            <CloseCircleOutlined className="mr-1" /> Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId)
              confirmMarkComplete(slot.id)
            }}
            className="flex items-center px-3 py-1 text-white transition-colors bg-green-600 rounded hover:bg-green-700"
          >
            <CheckCircleOutlined className="mr-1" /> Confirm
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
      }
    )
  }

  const confirmMarkComplete = async (slotId) => {
    try {
      const result = await onMarkComplete(slotId)
      toast.success('Interview marked as complete successfully')
      return result
    } catch (error) {
      console.error('Error marking slot as complete:', error)
      toast.error('Failed to mark interview as complete')
    }
  }

  const getExpertiseBadge = (level) => {
    const levelLower = level?.toLowerCase() || ''
    if (levelLower === 'expert') {
      return <Badge color="warning">Expert</Badge>
    } else if (levelLower === 'moderate') {
      return <Badge color="info">Moderate</Badge>
    } else if (levelLower === 'beginner') {
      return <Badge color="success">Beginner</Badge>
    }
    return <Badge color="gray">Not specified</Badge>
  }

  // console.log(slot)
  const dateDifference = getDateDifference()

  const statusColor = slot.is_booked ? 'failure' : 'success'
  const statusText = slot.is_booked ? 'Booked' : 'Available'

  const getDateTag = () => {
    if (!dateDifference) return null

    if (dateDifference.isSame) {
      return <Tag color="green">Today</Tag>
    } else if (dateDifference.isBefore) {
      return (
        <Tag color="orange" icon={<ArrowLeftOutlined />}>
          {dateDifference.days} day{dateDifference.days !== 1 ? 's' : ''} before
        </Tag>
      )
    } else {
      return (
        <Tag color="blue" icon={<ArrowRightOutlined />}>
          {dateDifference.days} day{dateDifference.days !== 1 ? 's' : ''} after
        </Tag>
      )
    }
  }

  return (
    <>
      <Card className="w-full max-w-sm mb-4 overflow-hidden transition-all duration-300 border border-gray-200 hover:shadow-xl rounded-xl">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3 sm:flex-nowrap">
          <Badge
            color={statusColor}
            size="sm"
            className="px-3 py-1.5 font-medium rounded-lg text-sm"
          >
            {statusText}
          </Badge>
          <Space className="mt-1 sm:mt-0">
            {!slot.is_booked && userRole !== 'candidate' && (
              <Tooltip content="Delete slot">
                <Button
                  color="failure"
                  size="xs"
                  pill
                  onClick={handleDelete}
                  className="flex items-center gap-1"
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            )}
            {slot.is_booked && userRole === 'interviewer' && onMarkComplete && (
              <Tooltip content="Mark as complete">
                <Button
                  color="success"
                  size="xs"
                  pill
                  onClick={handleMarkComplete}
                  className="flex items-center gap-1"
                >
                  <CheckCircleOutlined />
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>

        <div className="px-4 py-3 mb-4 -mx-4 -mt-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h5 className="flex flex-wrap items-center gap-2 mb-2 text-lg font-semibold text-gray-800">
            <HiCalendar className="text-blue-600" />
            <span className="break-words">{start.toDateString()}</span>
            <span className="w-full mt-1 sm:w-auto sm:mt-0">
              {getDateTag()}
            </span>
          </h5>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <HiClock className="flex-shrink-0 text-blue-500" />
            <span className="font-medium break-words">
              {formatTime(start)} → {formatTime(end)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
          <div className="p-3 rounded-lg bg-blue-50">
            <p className="flex items-center gap-2 mb-1 text-sm text-gray-700">
              <HiUser className="flex-shrink-0 text-blue-500" />
              <span className="font-medium">Interviewer</span>
            </p>
            <p className="ml-6 text-sm font-medium text-gray-900 break-words">
              {slot.interviewer_name || 'Not assigned'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50">
            <p className="flex items-center gap-2 mb-1 text-sm text-gray-700">
              <HiAcademicCap className="flex-shrink-0 text-indigo-500" />
              <span className="font-medium">Level</span>
            </p>
            <div className="ml-6">
              {getExpertiseBadge(slot.expertise_level)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-gray-50 sm:flex-nowrap">
          <HiVideoCamera className="flex-shrink-0 text-lg text-gray-600" />
          <div className="w-full sm:w-auto">
            <span className="mr-1 text-sm font-medium text-gray-700">
              Mode:
            </span>
            <span className="text-sm text-gray-900 break-words">
              {slot.mode || 'Not specified'}
            </span>
          </div>
        </div>
      </Card>

      <Modal
        title="Confirm Deletion"
        open={confirmModalVisible}
        onOk={confirmDelete}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this interview slot?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  )
}

export default SlotCard
