// src/pages/Result.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import { getResultById, getTestById } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

const ScoreMeter = ({ score }) => {
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'
  const label = score >= 70 ? 'Excellent' : score >= 40 ? 'Average' : 'Needs Improvement'
  const r = 56
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center mb-3">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
          <circle
            cx="70" cy="70" r={r}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-display font-bold" style={{ color }}>{score}%</div>
        </div>
      </div>
      <span className="font-body font-medium text-sm" style={{ color }}>{label}</span>
    </div>
  )
}

export default function Result() {
  const { id } = useParams()
  const { userProfile } = useAuth()
  const [result, setResult] = useState(null)
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getResultById(id)
        if (!r) return
        setResult(r)
        const t = await getTestById(r.testId)
        setTest(t)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-body text-sm">Loading results…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="card text-center max-w-sm mx-4">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 font-body">Result not found.</p>
          </div>
        </div>
      </div>
    )
  }

  const isTeacher = userProfile?.role === 'teacher'

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'}
              className="text-slate-500 hover:text-white font-body text-sm transition-colors"
            >
              ← Back
            </Link>
          </div>
          <h1 className="page-title">Test Results</h1>
          <p className="text-slate-400 font-body text-sm mt-1">{result.testTitle}</p>
        </div>

        {/* Score + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card flex items-center justify-center py-8 md:col-span-1">
            <ScoreMeter score={result.score || 0} />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {[
              { label: 'Correct', value: result.correct, icon: '✓', color: 'text-emerald-400' },
              { label: 'Incorrect', value: (result.total - result.correct), icon: '✗', color: 'text-red-400' },
              { label: 'Total Questions', value: result.total, icon: '📋', color: 'text-gold-400' },
              { label: 'Submitted', value: result.submittedAt?.toDate?.()?.toLocaleDateString() || '—', icon: '🕐', color: 'text-slate-400' },
            ].map(s => (
              <div key={s.label} className="card">
                <div className={`text-2xl font-display font-semibold mb-1 ${s.color}`}>
                  {s.value}
                </div>
                <div className="text-slate-400 text-xs font-body">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Feedback */}
        {result.aiFeedback && (
          <div className="card mb-8 animate-slide-up border-gold-400/15">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold-400/15 border border-gold-400/20 flex items-center justify-center text-base flex-shrink-0">
                ✨
              </div>
              <div>
                <h2 className="section-title text-base">AI Performance Analysis</h2>
                <p className="text-xs text-slate-500 font-body">Powered by Google Gemini</p>
              </div>
            </div>
            <div className="bg-navy-900/60 rounded-xl p-4 border border-white/5">
              <p className="text-slate-300 font-body text-sm leading-relaxed whitespace-pre-wrap">
                {result.aiFeedback}
              </p>
            </div>
          </div>
        )}

        {/* Review Answers toggle */}
        {test?.questions && (
          <div className="animate-slide-up">
            <button
              onClick={() => setShowReview(v => !v)}
              className="btn-secondary w-full mb-6 flex items-center justify-center gap-2"
            >
              {showReview ? '▲ Hide Answer Review' : '▼ Review All Answers'}
            </button>

            {showReview && (
              <div className="space-y-4">
                {test.questions.map((q, i) => (
                  <QuestionCard
                    key={i}
                    question={q}
                    index={i}
                    selectedAnswer={result.answers?.[i]}
                    showResult={true}
                    disabled={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Link
            to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'}
            className="btn-secondary flex-1 text-center"
          >
            ← Dashboard
          </Link>
          {!isTeacher && (
            <Link to="/student/tests" className="btn-primary flex-1 text-center">
              Take Another Test
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
