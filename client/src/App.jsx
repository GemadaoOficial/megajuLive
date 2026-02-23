import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { TrainingProvider, useTraining } from './contexts/TrainingContext'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Analytics from './pages/analytics/Analytics'
import Calendar from './pages/calendar/Calendar'
import LiveExecutor from './pages/live/LiveExecutor'
import Tutorials from './pages/tutorials/Tutorials'
import AdminPanel from './pages/admin/AdminPanel'
import UserManagement from './pages/admin/UserManagement'
import TutorialEditor from './pages/admin/TutorialEditor'
import LivesManagement from './pages/admin/LivesManagement'
import AuditLogs from './pages/admin/AuditLogs'
import Backup from './pages/admin/Backup'
import Settings from './pages/admin/Settings'
import AIUsage from './pages/admin/AIUsage'
import Profile from './pages/profile/Profile'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Route that requires training to be complete
function TrainingRequiredRoute({ children }) {
  const { user } = useAuth()
  const { isTrainingComplete, loading } = useTraining()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Admins can always access
  if (user?.role === 'ADMIN') {
    return children
  }

  // If training not complete, redirect to tutorials
  if (!isTrainingComplete) {
    return <Navigate to="/tutorials" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="calendar" element={<Calendar />} />
        <Route
          path="live"
          element={
            <TrainingRequiredRoute>
              <LiveExecutor />
            </TrainingRequiredRoute>
          }
        />
        <Route
          path="live/:id"
          element={
            <TrainingRequiredRoute>
              <LiveExecutor />
            </TrainingRequiredRoute>
          }
        />
        <Route path="tutorials" element={<Tutorials />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <PrivateRoute adminOnly>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <PrivateRoute adminOnly>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/tutorials"
          element={
            <PrivateRoute adminOnly>
              <TutorialEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/lives"
          element={
            <PrivateRoute adminOnly>
              <LivesManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/logs"
          element={
            <PrivateRoute adminOnly>
              <AuditLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/backup"
          element={
            <PrivateRoute adminOnly>
              <Backup />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <PrivateRoute adminOnly>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/ai-usage"
          element={
            <PrivateRoute adminOnly>
              <AIUsage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <TrainingProvider>
        <AppRoutes />
      </TrainingProvider>
    </div>
  )
}

export default App
