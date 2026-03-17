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
    { to: '/leaderboard', label: 'Leaderboard' },
  ]
  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/tests', label: 'Browse Tests' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ]

  const links = isTeacher ? teacherLinks : studentLinks

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between p-4 border-b border-white/5 backdrop-blur-xl bg-navy-950/80">
        <Link to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} className="flex items-center gap-2">
          <LogoMark />
          <span className="font-display font-semibold text-lg text-white">AI<span className="text-gold-400">Guru</span></span>
        </Link>
        {/* Simple mobile menu handler could go here (omitted for simplicity, users will use main view or we just put links below) */}
      </div>

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 h-screen w-0 md:w-64 border-r border-white/5 backdrop-blur-xl bg-navy-950/80 z-40 hidden md:flex flex-col transition-all overflow-hidden duration-300">
        <div className="p-6 flex-shrink-0">
          <Link to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} className="flex items-center gap-2.5 group">
            <LogoMark />
            <span className="font-display font-semibold text-2xl text-white tracking-tight">
              AI<span className="text-gold-400">Guru</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {currentUser && links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium transition-all duration-150 ${
                location.pathname === link.to
                  ? 'bg-gold-400/10 text-gold-400 shadow-[inset_3px_0_0_0_#fbbf24]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {currentUser && (
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-9 h-9 rounded-full bg-gold-400/20 flex flex-shrink-0 items-center justify-center">
                <span className="text-gold-400 text-sm font-semibold font-body">
                  {userProfile?.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-body font-medium text-white truncate">{userProfile?.name || 'User'}</p>
                <p className="text-xs font-body text-slate-500 capitalize truncate">{userProfile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Sticky Navigation Bottom (Optional fallback) or just hide side links on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-md border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around p-2">
          {currentUser && links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-lg text-[10px] font-medium ${
                location.pathname === link.to
                  ? 'text-gold-400'
                  : 'text-slate-400'
              }`}
            >
              <span>{link.label.split(' ')[0]}</span>
            </Link>
          ))}
          {currentUser && (
            <button onClick={handleLogout} className="flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-lg text-[10px] font-medium text-red-400">
              Sign out
            </button>
          )}
        </div>
      </div>
    </>
  )
}
