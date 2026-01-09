import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')

    if (token && userId && role) {
      setUser({ id: userId, role })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/login`,
        {
          email,
          password,
        }
      )

      const { token, user } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('role', user.role)
      setUser({ id: user.id, role: user.role })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
