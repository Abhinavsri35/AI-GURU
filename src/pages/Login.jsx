// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, logoutUser } from '../firebase/auth'
import { getUserDocument } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()

  // If already logged in, redirect
  if (currentUser && userProfile && currentUser.emailVerified) {
    navigate(userProfile.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginUser(email, password)
      if (!user.emailVerified) {
        await logoutUser()
        setError('Please verify your email address before logging in. Check your inbox.')
        return
      }
      const profile = await getUserDocument(user.uid)
      navigate(profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.'
      case 'auth/wrong-password': return 'Incorrect password.'
      case 'auth/invalid-email': return 'Invalid email address.'
      case 'auth/too-many-requests': return 'Too many attempts. Try again later.'
      default: return 'Login failed. Please try again.'
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      {/* Background decorative lines */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/10 to-transparent" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/5 to-transparent" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
              <span className="text-gold-400 text-lg">⚡</span>
            </div>
            <h1 className="text-2xl font-display font-semibold text-white">
              AI<span className="text-gold-400">Guru</span>
            </h1>
          </div>
          <p className="text-slate-400 font-body text-sm">Smart Classroom Assessment Platform</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-display font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 font-body mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm font-body text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
