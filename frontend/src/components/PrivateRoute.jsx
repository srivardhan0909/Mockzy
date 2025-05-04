import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth()
  const userRole = localStorage.getItem('role')

  if (!user) {
    return <Navigate to="/home" />
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />
  }

  return children
}

export default PrivateRoute
