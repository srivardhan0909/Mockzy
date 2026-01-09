import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Spinner, Card } from 'flowbite-react'
import { API_BASE } from '../utils/api'
import {
  Table,
  Typography,
  Space,
  Tag,
  Modal,
  Empty,
  Tooltip,
  Badge,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DeleteOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { confirm } = Modal

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Use the dedicated endpoint for user bookings
      const response = await axios.get(
        `${API_BASE}/slots/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setBookings(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to fetch bookings')
      setError('Failed to fetch bookings')
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    confirm({
      title: 'Are you sure you want to cancel this booking?',
      icon: <ExclamationCircleOutlined />,
      content: 'This will remove the interview from your schedule.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        confirmCancelBooking(bookingId)
      },
    })
  }

  const confirmCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token')
      // Use the new cancel booking endpoint
      await axios.post(
        `${API_BASE}/slots/${bookingId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Remove booking from the UI
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== bookingId)
      )

      toast.success('Booking cancelled successfully')
    } catch (error) {
      console.error('Error canceling booking:', error)

      if (error.response && error.response.status === 404) {
        toast.error('Booking not found or already cancelled')
      } else {
        toast.error('Failed to cancel booking. Please try again.')
      }
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'

    try {
      const timeParts = timeString.split(':')
      const hours = parseInt(timeParts[0])
      const minutes = parseInt(timeParts[1])

      const date = new Date()
      date.setHours(hours)
      date.setMinutes(minutes)

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch (error) {
      console.error('Error formatting time:', error)
      return timeString
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (
        <Space>
          <CalendarOutlined className="text-primary-500" />
          {formatDate(text)}
        </Space>
      ),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text, record) => (
        <Space>
          <ClockCircleOutlined className="text-primary-500" />
          {formatTime(text)}
          {record.duration && (
            <Text type="secondary">({record.duration} mins)</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Interviewer',
      dataIndex: 'interviewer_name',
      key: 'interviewer_name',
      render: (text) => (
        <Space>
          <UserOutlined className="text-primary-500" />
          {text || 'Not assigned'}
        </Space>
      ),
    },
    {
      title: 'Experience Level',
      dataIndex: 'expertise_level',
      key: 'expertise_level',
      render: (text) => {
        let color = 'default'
        if (text && text.toLowerCase() === 'expert') {
          color = 'gold'
        } else if (text && text.toLowerCase() === 'moderate') {
          color = 'blue'
        } else if (text && text.toLowerCase() === 'beginner') {
          color = 'green'
        }
        return <Tag color={color}>{text || 'Not specified'}</Tag>
      },
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      render: (text) => (
        <Badge
          status={text === 'Online' ? 'success' : 'processing'}
          text={text || 'Not specified'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.interviewer_email && (
            <Tooltip title={`Email: ${record.interviewer_email}`}>
              <Button size="xs" color="info">
                <MailOutlined />
              </Button>
            </Tooltip>
          )}
          <Button
            size="xs"
            color="failure"
            onClick={() => handleCancelBooking(record.id)}
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Button disabled>
          <Spinner size="sm" className="me-3" />
          Loading...
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <Card className="max-w-md w-full bg-red-50 border-red-300">
          <div className="text-center text-red-600">
            <ExclamationCircleOutlined className="text-3xl mb-2" />
            <Title level={4} className="text-red-600">
              Error Loading Bookings
            </Title>
            <Text>{error}</Text>
            <div className="mt-4">
              <Button color="blue" onClick={() => fetchBookings()}>
                Try Again
              </Button>
              <Button
                color="light"
                onClick={() => navigate('/all-slots')}
                className="ml-2"
              >
                Browse Slots
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button color="light" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeftOutlined className="mr-1" /> Back
          </Button>
          <Title level={2} className="m-0">
            My Bookings
          </Title>
        </div>

        <Empty
          description="You don't have any bookings yet"
          className="my-12"
        />

        <div className="text-center">
          <Button color="blue" onClick={() => navigate('/all-slots')}>
            Browse Available Slots
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Title level={2} className="m-0">
            My Booked Interviews
          </Title>
          <Button color="blue" onClick={() => navigate('/all-slots')}>
            <div className="flex items-center">
              <ArrowLeftOutlined className="mr-2" /> Back to Slots
            </div>
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table
            columns={columns}
            dataSource={bookings.map((booking) => ({
              ...booking,
              key: booking.id,
            }))}
            pagination={{ pageSize: 10 }}
            responsive
            className="my-bookings-table"
          />
        </div>
      </div>
    </div>
  )
}

export default MyBookings
