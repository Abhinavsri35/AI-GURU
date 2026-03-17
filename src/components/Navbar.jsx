// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../firebase/auth'

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="2" y="14" width="10" height="12" rx="1.5" fill="#fbbf24" opacity="0.9" />
    <rect x="8" y="8" width="10" height="18" rx="1.5" fill="#fbbf24" opacity="0.6" />
    <rect x="14" y="4" width="10" height="22" rx="1.5" fill="#fbbf24" opacity="0.3" />
    <circle cx="7" cy="7" r="3" fill="#fbbf24" />
  </svg>
)

export default function Navbar() {
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  const isTeacher = userProfile?.role === 'teacher'

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard' },
    { to: '/teacher/generate-test', label: 'Generate Test' },
  ]
  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/tests', label: 'Browse Tests' },
  ]

  const links = isTeacher ? teacherLinks : studentLinks

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-navy-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} className="flex items-center gap-2.5 group">
            <LogoMark />
            <span className="font-display font-semibold text-lg text-white tracking-tight">
              Vidya<span className="text-gold-400">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all duration-150 ${
                    location.pathname === link.to
                      ? 'bg-gold-400/10 text-gold-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gold-400/20 flex items-center justify-center">
                  <span className="text-gold-400 text-xs font-semibold font-body">
                    {userProfile?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-body font-medium text-white leading-none">{userProfile?.name || 'User'}</p>
                  <p className="text-xs font-body text-slate-500 mt-0.5 capitalize">{userProfile?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost text-sm px-3 py-1.5"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
