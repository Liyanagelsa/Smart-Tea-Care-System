import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import Sidebar from './Sidebar'

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl animate-bounce block mb-4">🍃</span>
          <p className="text-[#1c5f20] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-[#faf9f6] flex relative pl-64">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}

