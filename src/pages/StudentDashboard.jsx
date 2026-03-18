import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getResultsByStudent, getTestById } from '../firebase/firestore'

const ScoreRing = ({ score }) => {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
        <circle
          cx="50" cy="50" r={r}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-display font-semibold" style={{ color }}>{score}%</span>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { userProfile } = useAuth()
  const [results, setResults] = useState([])
  const [recentTests, setRecentTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return
      try {
        const myResults = await getResultsByStudent(userProfile.id)
        setResults(myResults)

        const enriched = await Promise.all(
          myResults.slice(0, 5).map(async (r) => {
            const test = await getTestById(r.testId)
            return { ...r, testTitle: test?.title || 'Unknown Test', topic: test?.topic || '' }
          })
        )
        setRecentTests(enriched)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userProfile])

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length)
    : 0

  const bestScore = results.length
    ? Math.max(...results.map(r => r.score || 0))
    : 0

  return (
    <div className="min-h-screen mesh-bg">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <p className="text-slate-400 font-body text-sm mb-1">Welcome back,</p>
          <h1 className="page-title">{userProfile?.name || 'Student'}</h1>
          <p className="text-slate-400 font-body mt-2 text-sm">Track your learning progress below.</p>
        </div>

        {/* Stats row */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-slide-up">
            {[
              { label: 'Tests Taken', value: results.length, icon: '📋', color: 'text-gold-400' },
              { label: 'Avg Score', value: `${avgScore}%`, icon: '📊', color: 'text-blue-400' },
              { label: 'Best Score', value: `${bestScore}%`, icon: '🏆', color: 'text-emerald-400' },
              { label: 'Available', value: '∞', icon: '📚', color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-2xl font-display font-semibold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 font-body mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Results */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Recent Results</h2>
              <Link to="/student/tests" className="btn-secondary text-sm py-1.5 px-4">Browse Tests →</Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : recentTests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🎓</p>
                <p className="text-slate-400 font-body text-sm mb-4">No tests taken yet.</p>
                <Link to="/student/tests" className="btn-primary text-sm">Start your first test</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTests.map((result) => (
                  <Link
                    key={result.id}
                    to={`/result/${result.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all duration-150"
                  >
                    <ScoreRing score={result.score || 0} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-body font-medium text-sm truncate">{result.testTitle}</p>
                      <p className="text-slate-500 text-xs font-body mt-0.5">{result.topic}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-400 text-xs font-body">
                        {result.submittedAt?.toDate?.()?.toLocaleDateString() || '—'}
                      </p>
                      <span className={`text-xs font-body font-medium mt-1 inline-block
                        ${result.score >= 70 ? 'text-emerald-400' : result.score >= 40 ? 'text-gold-400' : 'text-red-400'}`}>
                        {result.score >= 70 ? 'Passed' : result.score >= 40 ? 'Average' : 'Needs Work'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions + summary */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="section-title mb-4">Jump In</h2>
              <Link
                to="/student/tests"
                className="flex items-center gap-4 p-4 rounded-xl border border-gold-400/20 bg-gold-400/5 hover:bg-gold-400/10 hover:border-gold-400/40 transition-all duration-150 group w-full"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-400/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  📝
                </div>
                <div>
                  <p className="text-white font-body font-medium text-sm">Take a Test</p>
                  <p className="text-slate-500 text-xs font-body mt-0.5">Browse available tests</p>
                </div>
              </Link>
            </div>

            {avgScore > 0 && (
              <div className="card text-center">
                <h2 className="section-title mb-4">Overall Progress</h2>
                <ScoreRing score={avgScore} />
                <p className="text-slate-400 font-body text-sm mt-3">
                  {avgScore >= 70
                    ? 'Great performance! Keep it up.'
                    : avgScore >= 40
                    ? 'Good progress. Review weak areas.'
                    : 'Focus on fundamentals and retry.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
