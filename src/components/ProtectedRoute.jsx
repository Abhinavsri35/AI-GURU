// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { currentUser, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-body text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/login" replace />
  }

  // If a specific role is required, check it
  if (role && userProfile?.role !== role) {
    const redirect = userProfile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
    return <Navigate to={redirect} replace />
  }

  return children
}
