import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card, Timeline } from 'flowbite-react'
import { Typography, Space, Row, Col, Divider, Statistic } from 'antd'
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  CalendarOutlined,
  LaptopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Title, Paragraph, Text } = Typography

function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'interviewer') {
        navigate('/interviewer-dashboard')
      } else {
        navigate('/all-slots')
      }
    } else {
      navigate('/register')
    }
  }

  const getButtonText = () => {
    if (!user) return 'Start Practicing'
    if (user.role === 'interviewer') return 'Go to Dashboard'
    return 'Browse Available Slots'
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  return (
    <motion.div
      className="bg-gradient-to-b from-blue-50 to-white pb-16 -mx-4 md:-mx-6 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20"
        variants={itemVariants}
      >
        <div className="text-center relative">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Title
              level={1}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              Master Your Interview Skills with
              <span className="text-primary-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}
                Mockzy
              </span>
            </Title>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Paragraph className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Practice with real interviewers, get instant feedback, and boost
              your confidence. Our platform matches you with the perfect
              interviewer based on your expertise level.
            </Paragraph>
          </motion.div>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              gradientDuoTone="cyanToBlue"
              size="lg"
              onClick={handleGetStarted}
              className="px-8 py-3 text-base font-medium rounded-lg btn-pulse shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center">
                {getButtonText()}
                <ArrowRightOutlined className="ml-2" />
              </div>
            </Button>
            {!user && (
              <Button
                color="light"
                size="lg"
                onClick={() => navigate('/login')}
                className="border border-blue-600 text-blue-600 px-8 py-3 text-base font-medium rounded-lg hover:bg-blue-50 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
              >
                Sign In
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div className="bg-white py-14 shadow-sm" variants={itemVariants}>
        <div className="max-w-7xl mx-auto px-4">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-gray-700 font-medium">
                    Active Interviewers
                  </span>
                }
                value={50}
                prefix={<TeamOutlined className="text-blue-600 mr-2" />}
                className="text-center"
                valueStyle={{ fontSize: 28, fontWeight: 600, color: '#1a56db' }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-gray-700 font-medium">
                    Interviews Completed
                  </span>
                }
                value={1250}
                prefix={<CheckCircleOutlined className="text-green-600 mr-2" />}
                className="text-center"
                valueStyle={{ fontSize: 28, fontWeight: 600, color: '#059669' }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-gray-700 font-medium">
                    Available Slots
                  </span>
                }
                value={122}
                prefix={<CalendarOutlined className="text-amber-600 mr-2" />}
                className="text-center"
                valueStyle={{ fontSize: 28, fontWeight: 600, color: '#d97706' }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title={
                  <span className="text-gray-700 font-medium">
                    Supported Technologies
                  </span>
                }
                value={24}
                prefix={<LaptopOutlined className="text-purple-600 mr-2" />}
                className="text-center"
                valueStyle={{ fontSize: 28, fontWeight: 600, color: '#7c3aed' }}
              />
            </Col>
          </Row>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div className="py-20" variants={itemVariants}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <Title
              level={2}
              className="text-center text-3xl sm:text-4xl font-bold mb-4"
            >
              Why Choose Mockzy?
            </Title>
            <Divider className="max-w-xs mx-auto mb-8 border-blue-200" />
          </motion.div>

          <Row gutter={[32, 32]}>
            {/* Feature 1 */}
            <Col xs={24} md={8}>
              <motion.div
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg card-soft-shadow border-gray-200">
                  <div className="text-blue-600 text-5xl mb-6 flex justify-center">
                    <RiseOutlined />
                  </div>
                  <Title level={4} className="text-center mb-4 text-gray-900">
                    Expert-Level Matching
                  </Title>
                  <Paragraph className="text-center text-gray-600">
                    Get matched with interviewers based on your expertise level
                    for the most relevant practice.
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>

            {/* Feature 2 */}
            <Col xs={24} md={8}>
              <motion.div
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg card-soft-shadow border-gray-200">
                  <div className="text-green-600 text-5xl mb-6 flex justify-center">
                    <ClockCircleOutlined />
                  </div>
                  <Title level={4} className="text-center mb-4 text-gray-900">
                    Flexible Scheduling
                  </Title>
                  <Paragraph className="text-center text-gray-600">
                    Book interviews at your convenience with our easy-to-use
                    calendar system.
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>

            {/* Feature 3 */}
            <Col xs={24} md={8}>
              <motion.div
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg card-soft-shadow border-gray-200">
                  <div className="text-purple-600 text-5xl mb-6 flex justify-center">
                    <UserOutlined />
                  </div>
                  <Title level={4} className="text-center mb-4 text-gray-900">
                    Personalized Feedback
                  </Title>
                  <Paragraph className="text-center text-gray-600">
                    Receive detailed feedback and suggestions to improve after
                    each interview session.
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        className="py-20 bg-gradient-to-b from-white to-blue-50"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <Title
              level={2}
              className="text-center text-3xl sm:text-4xl font-bold mb-4"
            >
              How It Works
            </Title>
            <Divider className="max-w-xs mx-auto mb-8 border-blue-200" />
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Timeline>
              <Timeline.Item className="flowbite-timeline-item">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Title level={5} className="text-xl font-semibold mb-2">
                    Create Your Account
                  </Title>
                  <Paragraph className="text-gray-600">
                    Sign up and upload your resume. Our system will analyze your
                    skills and experience level.
                  </Paragraph>
                </motion.div>
              </Timeline.Item>
              <Timeline.Item className="flowbite-timeline-item">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Title level={5} className="text-xl font-semibold mb-2">
                    Browse Available Slots
                  </Title>
                  <Paragraph className="text-gray-600">
                    Explore and filter interview slots based on expertise level,
                    date, or time that work for you.
                  </Paragraph>
                </motion.div>
              </Timeline.Item>
              <Timeline.Item className="flowbite-timeline-item">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Title level={5} className="text-xl font-semibold mb-2">
                    Book Your Interview
                  </Title>
                  <Paragraph className="text-gray-600">
                    Select a slot and book your mock interview session with just
                    a few clicks.
                  </Paragraph>
                </motion.div>
              </Timeline.Item>
              <Timeline.Item className="flowbite-timeline-item">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Title level={5} className="text-xl font-semibold mb-2">
                    Attend and Improve
                  </Title>
                  <Paragraph className="text-gray-600">
                    Join your interview, practice your skills, and receive
                    valuable feedback to enhance your performance.
                  </Paragraph>
                </motion.div>
              </Timeline.Item>
            </Timeline>
          </div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button
              gradientDuoTone="purpleToBlue"
              size="lg"
              onClick={handleGetStarted}
              className="px-8 py-3 text-base font-medium rounded-lg shadow-md hover:shadow-lg btn-pulse"
            >
              <div className="flex items-center">
                {user ? 'Book Your First Interview' : 'Get Started Today'}
                <ArrowRightOutlined className="ml-2" />
              </div>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Home
