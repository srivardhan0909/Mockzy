import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaChartLine,
} from 'react-icons/fa'

function Home() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/register')
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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Navigation Bar */}
      <motion.nav
        className="bg-white shadow-sm fixed w-full top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl font-bold text-blue-600">Mockzy</span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
        variants={itemVariants}
      >
        <div className="text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Master Your Interview Skills with
            <span className="text-blue-600"> Mockzy</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Practice with real interviewers, get instant feedback, and boost
            your confidence. Our AI-powered platform matches you with the
            perfect interviewer based on your expertise level.
          </motion.p>
          <motion.div
            className="flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Start Practicing
              <FaArrowRight className="ml-2" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors duration-200"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Sign In
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div className="bg-white py-16" variants={itemVariants}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Why Choose Mockzy?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="bg-blue-50 p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-blue-600 text-4xl mb-4">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert-Level Matching
              </h3>
              <p className="text-gray-600">
                Get matched with interviewers based on your expertise level for
                the most relevant practice.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-blue-50 p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-blue-600 text-4xl mb-4">
                <FaCheckCircle />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Resume Analysis
              </h3>
              <p className="text-gray-600">
                Upload your resume for instant analysis and personalized
                interview recommendations.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-blue-50 p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-blue-600 text-4xl mb-4">
                <FaClock />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible Scheduling
              </h3>
              <p className="text-gray-600">
                Book interviews at your convenience with our easy-to-use
                scheduling system.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div className="py-16" variants={itemVariants}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600">
                Create your account and set up your profile
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Resume
              </h3>
              <p className="text-gray-600">Get your expertise level analyzed</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Book Interview
              </h3>
              <p className="text-gray-600">Choose a slot that works for you</p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Practice & Improve
              </h3>
              <p className="text-gray-600">
                Get feedback and track your progress
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900 text-white py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div className="mb-4 md:mb-0" whileHover={{ scale: 1.05 }}>
              <span className="text-2xl font-bold text-blue-400">Mockzy</span>
              <p className="text-gray-400 mt-2">
                Your path to interview success
              </p>
            </motion.div>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                About
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                Contact
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
              >
                Privacy Policy
              </motion.a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            © {new Date().getFullYear()} Mockzy. All rights reserved.
          </div>
        </div>
      </motion.footer>
    </motion.div>
  )
}

export default Home
