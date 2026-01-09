import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Card,
  Label,
  TextInput,
  Button,
  Spinner,
  FileInput,
} from 'flowbite-react'
import { Form, Typography, Upload, Divider, Alert } from 'antd'
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons'
import LoginImg from '../assets/register.png'
import { API_BASE } from '../utils/api'

const { Title, Text } = Typography

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeFileName, setResumeFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const checkExistingResume = async (userId, token) => {
    try {
      const response = await axios.get(
        `${API_BASE}/resumes/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password,
      })

      if (res.data && res.data.token) {
        const { token, user } = res.data
        
        // Store all data first
        localStorage.setItem('token', token)
        localStorage.setItem('userId', user.id)
        localStorage.setItem('role', user.role)
        localStorage.setItem('username', user.username)

        toast.success('Login successful!')

        // If user is a candidate, check for existing resume
        if (user.role === 'candidate') {
          const hasResume = await checkExistingResume(user.id, token)
          
          if (hasResume) {
            // Redirect immediately if resume exists
            window.location.href = '/all-slots'
          } else {
            // Show resume upload form
            setLoading(false)
            setShowResumeUpload(true)
          }
        } else {
          // Redirect interviewers immediately
          window.location.href = '/interviewer-dashboard'
        }
      } else {
        setLoading(false)
        toast.error('Invalid response from server')
      }
    } catch (error) {
      setLoading(false)
      console.error('Login error:', error)
      toast.error(
        error.response?.data?.message || 'Login failed. Please try again.'
      )
    }
  }

  const handleResumeUpload = async (e) => {
    e.preventDefault()
    if (!resumeFile) {
      toast.error('Please select a resume file')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('resume', resumeFile)

    try {
      const res = await axios.post(
        `${API_BASE}/resumes/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (res.data) {
        toast.success('Resume uploaded successfully!')
        // Use window.location for full page reload to ensure state is fresh
        window.location.href = '/all-slots'
      }
    } catch (error) {
      setLoading(false)
      console.error('Resume upload error:', error)
      if (
        error.response?.data?.message === 'You already have a resume uploaded'
      ) {
        toast.info('You already have a resume uploaded')
        window.location.href = '/all-slots'
      } else {
        toast.error(
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 md:flex-row bg-gray-50">
      <div className="hidden max-w-md mb-6 md:block md:w-1/2 md:mb-0 md:mr-8">
        <img src={LoginImg} alt="Login" className="w-full h-auto" />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <div className="flex justify-center mb-4">
          <Title level={3} className="text-center text-primary-600">
            {showResumeUpload ? 'Upload Resume' : 'Welcome to Mockzy'}
          </Title>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Spinner size="xl" />
            <span className="ml-2">
              {showResumeUpload ? 'Uploading resume...' : 'Logging in...'}
            </span>
          </div>
        ) : !showResumeUpload ? (
          <Form layout="vertical" className="space-y-4">
            <div>
              <Label
                htmlFor="username"
                value="Username"
                className="text-gray-700"
              />
              <TextInput
                id="username"
                type="text"
                icon={UserOutlined}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                value="Password"
                className="text-gray-700"
              />
              <TextInput
                id="password"
                type="password"
                icon={LockOutlined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              color="blue"
              onClick={handleSubmit}
              className="w-full"
              disabled={loading}
            >
              Sign In
            </Button>

            <Divider plain>
              <Text type="secondary">Don't have an account?</Text>
            </Divider>

            <div className="text-center">
              <Link to="/register">
                <Button color="light" className="w-full">
                  Register Now
                </Button>
              </Link>
            </div>
          </Form>
        ) : (
          <div className="space-y-4">
            <Alert
              message="Resume Required"
              description="Please upload your resume to continue. This will help interviewers better understand your background."
              type="info"
              showIcon
              className="mb-4"
            />

            <Form onSubmit={handleResumeUpload} className="space-y-4">
              <div>
                <Label
                  htmlFor="resume"
                  value="Upload Resume"
                  className="text-gray-700"
                />
                <FileInput
                  id="resume"
                  helperText="PDF, DOC or DOCX (Max. 5MB)"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                {resumeFileName && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {resumeFileName}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                color="blue"
                onClick={handleResumeUpload}
                className="w-full"
                disabled={loading}
              >
                <UploadOutlined className="mr-2" />
                Upload Resume
              </Button>
            </Form>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Login