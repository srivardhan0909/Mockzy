import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import LoginImg from '../assets/register.png'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeFileName, setResumeFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const checkExistingResume = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/resumes/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      return !!response.data // resume exists
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false // No resume found, not an error
      }
      console.error('Error checking existing resume:', error)
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password,
      })

      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userId', res.data.user.id)
        localStorage.setItem('role', res.data.user.role)
        localStorage.setItem('username', res.data.user.username)

        // If user is a candidate, check for existing resume
        if (res.data.user.role === 'candidate') {
          const hasResume = await checkExistingResume(res.data.user.id)
          setLoading(false)
          if (hasResume) {
            navigate('/all-slots')
          } else {
            setShowResumeUpload(true)
          }
        } else {
          setLoading(false)
          navigate('/interviewer-dashboard')
        }
      } else {
        setLoading(false)
        setError('Invalid response from server')
      }
    } catch (error) {
      setLoading(false)
      console.error('Login error:', error)
      setError(
        error.response?.data?.message || 'Login failed. Please try again.'
      )
    }
  }

  const handleResumeUpload = async (e) => {
    e.preventDefault()
    if (!resumeFile) {
      setError('Please select a resume file')
      return
    }

    const formData = new FormData()
    formData.append('resume', resumeFile)

    try {
      const res = await axios.post(
        'http://localhost:3000/api/resumes/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (res.data) {
        navigate('/all-slots')
      }
    } catch (error) {
      console.error('Resume upload error:', error)
      if (
        error.response?.data?.message === 'You already have a resume uploaded'
      ) {
        navigate('/all-slots')
      } else {
        setError(
          error.response?.data?.message ||
            'Resume upload failed. Please try again.'
        )
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setResumeFile(file)
    setResumeFileName(file ? file.name : '')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <img src={LoginImg} alt="Login" className="w-[580px] mr-8" />
      <div className="w-full max-w-md mr-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {showResumeUpload ? 'Upload Resume' : 'Login'}
        </h1>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center text-gray-600">
            Checking resume status...
          </div>
        ) : !showResumeUpload ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username:
              </label>
              <input
                type="text"
                id="username"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
            <p className="mt-4 text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                Register
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResumeUpload}>
            <div className="mb-4">
              <label
                htmlFor="resume"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Resume:
              </label>
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                key={resumeFileName || 'file-input'}
              />
              {resumeFileName && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {resumeFileName}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Upload
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
