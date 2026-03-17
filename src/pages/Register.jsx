// src/pages/Register.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../firebase/auth'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/bg-logo.png';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { userProfile, currentUser } = useAuth()

  // Navigate once AuthContext has resolved the Firestore profile.
  // Do NOT navigate inside handleSubmit — the document may not be
  // readable yet when onAuthStateChanged fires immediately after signup.
  useEffect(() => {
    if (userProfile && currentUser?.emailVerified) {
      navigate(
        userProfile.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard',
        { replace: true }
      )
    }
  }, [userProfile, currentUser, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      // Create account — navigation handled by useEffect above
      await registerUser(form.name.trim(), form.email, form.password, form.role)
      setSuccess('Registration successful! Please check your email to verify your account.')
      setForm({ name: '', email: '', password: '', confirm: '', role: 'student' })
      setLoading(false)
    } catch (err) {
      const code = err.code
      if (code === 'auth/email-already-in-use') setError('Email already in use.')
      else if (code === 'auth/invalid-email') setError('Invalid email address.')
      else setError('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/8 to-transparent" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center">
              <img src={logoImg} alt='logo'/>
            </div>
            <h1 className="text-2xl font-display font-semibold text-white">
              AI<span className="text-gold-400">Guru</span>
            </h1>
          </div>
          <p className="text-slate-400 font-body text-sm">Smart Classroom Assessment Platform</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-display font-semibold text-white mb-1">Create account</h2>
          <p className="text-sm text-slate-400 font-body mb-6">Join AIGuru and start learning or teaching</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-body">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Your name" required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Min. 6 characters" required />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className="input" placeholder="••••••••" required />
            </div>

            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'teacher'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`py-3 rounded-xl border font-body text-sm font-medium transition-all duration-150 capitalize
                      ${form.role === r
                        ? 'border-gold-400/60 bg-gold-400/10 text-gold-400'
                        : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                  >
                    {r === 'student' ? '🎓 Student' : '📚 Teacher'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                  Setting up your account…
                </>
              ) : 'Create account'}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm font-body text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
