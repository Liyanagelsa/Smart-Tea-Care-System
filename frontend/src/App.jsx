import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context'
import { ProtectedLayout } from './components'
import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  DetectPage,
  HistoryPage,
  ProfilePage,
  AdminPage,
} from './pages'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/detect" element={<ProtectedLayout><DetectPage /></ProtectedLayout>} />
          <Route path="/history" element={<ProtectedLayout><HistoryPage /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
          <Route path="/admin" element={<ProtectedLayout><AdminPage /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f2d1a',
              color: '#86efac',
              border: '1px solid rgba(134, 239, 172, 0.2)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0f2d1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f2d1a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
