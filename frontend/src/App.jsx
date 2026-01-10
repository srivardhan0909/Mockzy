import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  NavLink,
} from 'react-router-dom'
import { Layout, ConfigProvider } from 'antd'
import { Navbar, Sidebar, Footer, Button } from 'flowbite-react'
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  FileOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  LoginOutlined,
  UserAddOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
// import AdminSlot from './pages/AdminSlot';
import AdminSlotList from './pages/AdminSlotList'
import AllSlots from './pages/AllSlots' // ✅ newly added
import InterviewerProfile from './pages/InterviewerProfile'
import InterviewerDashboard from './pages/InterviewerDashboard'
import SlotManagement from './pages/SlotManagement'
import { AuthProvider, useAuth } from './context/AuthContext'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import MyBookings from './pages/MyBookings'
import PrivateRoute from './components/PrivateRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const { Header, Content, Sider } = Layout

function NavbarComponent() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  if (isAuthPage) return null

  return (
    <Navbar
      fluid
      className="sticky top-0 z-30 py-3 bg-white border-b shadow-sm"
    >
      <Navbar.Brand
        as={Link}
        to="/"
        className="transition-all-smooth hover:opacity-80"
      >
        <span className="self-center text-xl font-semibold whitespace-nowrap text-primary-600">
          Mockzy
        </span>
      </Navbar.Brand>
      <div className="flex items-center gap-3 md:order-2">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">
              {user.username || 'User'}
            </span>
            <Button
              color="light"
              size="xs"
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 btn-pulse"
            >
              <LogoutOutlined className="text-gray-600" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              as={Link}
              to="/login"
              color="light"
              size="xs"
              className="px-2 sm:px-3 py-1.5 btn-pulse"
            >
              <LoginOutlined className="sm:mr-1.5" />
              <span className="hidden sm:inline">Login</span>
            </Button>
            <Button
              as={Link}
              to="/register"
              color="blue"
              size="xs"
              className="px-2 sm:px-3 py-1.5 btn-pulse"
            >
              <UserAddOutlined className="sm:mr-1.5" />
              <span className="hidden sm:inline">Register</span>
            </Button>
          </div>
        )}
        {/* Mobile menu toggle - only show when logged in */}
        {user && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </button>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {user && mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-40">
          <nav className="p-4 space-y-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <HomeOutlined className="mr-2" /> Home
            </NavLink>

            {user?.role === 'candidate' && (
              <>
                <NavLink
                  to="/all-slots"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <CalendarOutlined className="mr-2" /> All Slots
                </NavLink>
                <NavLink
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <FileOutlined className="mr-2" /> My Bookings
                </NavLink>
              </>
            )}

            {user?.role === 'interviewer' && (
              <>
                <NavLink
                  to="/interviewer-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <DashboardOutlined className="mr-2" /> Dashboard
                </NavLink>
                <NavLink
                  to="/slot-management"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <SettingOutlined className="mr-2" /> Manage Slots
                </NavLink>
                <NavLink
                  to="/interviewer-profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <UserOutlined className="mr-2" /> Profile
                </NavLink>
              </>
            )}

            {user?.role === 'admin' && (
              <NavLink
                to="/admin-slots"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <TeamOutlined className="mr-2" /> Admin Panel
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </Navbar>
  )
}

function SidebarComponent() {
  const { user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  if (isAuthPage || !user) return null

  // Custom active state styles
  const activeLink =
    'bg-primary-50 text-primary-600 font-medium border-r-4 border-primary-600'

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <Sidebar
        className="h-full bg-white border-r rounded-none shadow-sm"
        collapsed={collapsed}
      >
        {/* <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 m-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors duration-200 flex justify-center items-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <MenuUnfoldOutlined className="text-lg" />
          ) : (
            <MenuFoldOutlined className="text-lg" />
          )}
        </button> */}

        <Sidebar.Items>
          <Sidebar.ItemGroup className="px-2 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `sidebar-item p-2.5 flex items-center ${
                  isActive ? activeLink : 'hover:bg-gray-50'
                }`
              }
            >
              <Sidebar.Item icon={HomeOutlined} className="py-0" as="div">
                {!collapsed && <span className="ml-2">Home</span>}
              </Sidebar.Item>
            </NavLink>

            {user?.role === 'candidate' && (
              <>
                <NavLink
                  to="/all-slots"
                  className={({ isActive }) =>
                    `sidebar-item p-2.5 flex items-center ${
                      isActive ? activeLink : 'hover:bg-gray-50'
                    }`
                  }
                >
                  <Sidebar.Item icon={CalendarOutlined} className="py-0" as="div">
                    {!collapsed && <span className="ml-2">All Slots</span>}
                  </Sidebar.Item>
                </NavLink>

                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) =>
                    `sidebar-item p-2.5 flex items-center ${
                      isActive ? activeLink : 'hover:bg-gray-50'
                    }`
                  }
                >
                  <Sidebar.Item icon={FileOutlined} className="py-0" as="div">
                    {!collapsed && <span className="ml-2">My Bookings</span>}
                  </Sidebar.Item>
                </NavLink>
              </>
            )}

            {user?.role === 'interviewer' && (
              <>
                <NavLink
                  to="/interviewer-dashboard"
                  className={({ isActive }) =>
                    `sidebar-item p-2.5 flex items-center ${
                      isActive ? activeLink : 'hover:bg-gray-50'
                    }`
                  }
                >
                  <Sidebar.Item
                    icon={DashboardOutlined}
                    className="py-0"
                    as="div"
                  >
                    {!collapsed && <span className="ml-2">Dashboard</span>}
                  </Sidebar.Item>
                </NavLink>

                <NavLink
                  to="/slot-management"
                  className={({ isActive }) =>
                    `sidebar-item p-2.5 flex items-center ${
                      isActive ? activeLink : 'hover:bg-gray-50'
                    }`
                  }
                >
                  <Sidebar.Item
                    icon={SettingOutlined}
                    className="py-0"
                    as="div"
                  >
                    {!collapsed && (
                      <span className="ml-2">Manage Slots</span>
                    )}
                  </Sidebar.Item>
                </NavLink>

                <NavLink
                  to="/interviewer-profile"
                  className={({ isActive }) =>
                    `sidebar-item p-2.5 flex items-center ${
                      isActive ? activeLink : 'hover:bg-gray-50'
                    }`
                  }
                >
                  <Sidebar.Item icon={UserOutlined} className="py-0" as="div">
                    {!collapsed && <span className="ml-2">Profile</span>}
                  </Sidebar.Item>
                </NavLink>
              </>
            )}

            {user?.role === 'admin' && (
              <NavLink
                to="/admin-slots"
                className={({ isActive }) =>
                  `sidebar-item p-2.5 flex items-center ${
                    isActive ? activeLink : 'hover:bg-gray-50'
                  }`
                }
              >
                <Sidebar.Item icon={TeamOutlined} className="py-0" as="div">
                  {!collapsed && <span className="ml-2">Admin Panel</span>}
                </Sidebar.Item>
              </NavLink>
            )}
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  )
}

function FooterComponent() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-6 bg-white border-t border-gray-200 shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-primary-600">
              Mockzy
            </span>
            <span className="mt-1 ml-1 text-xs text-gray-500">®</span>
          </div>

          <div className="text-sm text-gray-500">
            &copy; {currentYear} Mockzy. All rights reserved.
          </div>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-gray-500 transition-colors duration-200 hover:text-primary-600"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-500 transition-colors duration-200 hover:text-primary-600"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-500 transition-colors duration-200 hover:text-primary-600"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function MainLayout({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  return (
    <Layout className="min-h-screen">
      <NavbarComponent />

      <Layout className="min-h-[calc(100vh-64px)]">
        {user && !isAuthPage && (
          <Sider
            width={200}
            className="bg-white h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden hidden lg:block"
            style={{ position: 'fixed', left: 0, top: 64, bottom: 0 }}
            breakpoint="lg"
            collapsedWidth="0"
            zeroWidthTriggerStyle={{ top: 64 }}
          >
            <SidebarComponent />
          </Sider>
        )}

        <Content
          className={`bg-gray-50 p-3 sm:p-4 md:p-6 transition-all duration-300 ease-in-out ${
            user && !isAuthPage ? 'lg:ml-[200px]' : ''
          }`}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </Content>
      </Layout>

      <FooterComponent />
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          icon={true}
          toastClassName="rounded-lg shadow-md"
          bodyClassName="text-sm font-medium"
        />
        <MainLayout>
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
        </MainLayout>
      </Router>
    </AuthProvider>
  )
}

export default App
