import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { CVProvider } from '@/context/CVContext'
import { CoverLetterProvider } from '@/context/CoverLetterContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'
import LoginPage from '@/pages/Login/LoginPage'
import RegisterPage from '@/pages/Register/RegisterPage'
import CallbackPage from '@/pages/Auth/CallbackPage'
import SessionExpiredPage from '@/pages/SessionExpired/SessionExpiredPage'
import DashboardPage from '@/pages/Dashboard/DashboardPage'
import ApplicationsPage from '@/pages/Applications/ApplicationsPage'
import CVPage from '@/pages/CV/CVPage'
import CVDetailPage from '@/pages/CV/CVDetailPage'
import SettingsPage from '@/pages/Settings/SettingsPage'

// Must be inside BrowserRouter + AuthProvider to use hooks
function InactivityGuard() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()

  useInactivityLogout(async () => {
    if (!session) return
    await signOut()
    navigate('/session-expired', { replace: true })
  })

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
        <CVProvider>
          <CoverLetterProvider>
            <BrowserRouter>
              <InactivityGuard />
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<CallbackPage />} />
                <Route path="/session-expired" element={<SessionExpiredPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
                <Route path="/cv" element={<ProtectedRoute><CVPage /></ProtectedRoute>} />
                <Route path="/cv/:cvCode" element={<ProtectedRoute><CVDetailPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
          </CoverLetterProvider>
        </CVProvider>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
