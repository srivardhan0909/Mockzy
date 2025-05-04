import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
// import AdminSlot from './pages/AdminSlot';
import AdminSlotList from './pages/AdminSlotList'
import AllSlots from './pages/AllSlots' // ✅ newly added
import InterviewerProfile from './pages/InterviewerProfile'
import InterviewerDashboard from './pages/InterviewerDashboard'
import SlotManagement from './pages/SlotManagement'
import { AuthProvider } from './context/AuthContext'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import MyBookings from './pages/MyBookings'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/my-bookings"
              element={
                <PrivateRoute>
                  <MyBookings />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-slots"
              element={
                <PrivateRoute role="admin">
                  <AdminSlotList />
                </PrivateRoute>
              }
            />
            <Route
              path="/all-slots"
              element={
                <PrivateRoute>
                  <AllSlots />
                </PrivateRoute>
              }
            />
            <Route
              path="/interviewer-profile"
              element={
                <PrivateRoute role="interviewer">
                  <InterviewerProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/interviewer-dashboard"
              element={
                <PrivateRoute role="interviewer">
                  <InterviewerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/slot-management"
              element={
                <PrivateRoute role="interviewer">
                  <SlotManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/resume-analyzer"
              element={
                <PrivateRoute>
                  <ResumeAnalyzer />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  )
}

export default App
