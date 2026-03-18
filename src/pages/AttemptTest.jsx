import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import QuestionCard from '../components/QuestionCard'
import { useAuth } from '../context/AuthContext'
import { getTestById, saveResult, getResultsByStudent } from '../firebase/firestore'
import { analyzePerformance } from '../services/aiService'

export default function AttemptTest() {
  const { id } = useParams()
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!userProfile?.id) return
    Promise.all([
      getTestById(id),
      getResultsByStudent(userProfile.id)
    ])
      .then(([testData, studentResults]) => {
        if (!testData) { setError('Test not found.'); return }
        const alreadyAttempted = studentResults.some(r => r.testId === id)
        if (alreadyAttempted) {
          setError('You have already attempted this test.')
          return
        }
        setTest(testData)
        if (testData.timeLimit > 0) {
          setTimeLeft(testData.timeLimit * 60)
        }
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [id, userProfile?.id])

  useEffect(() => {
    if (timeLeft === null || submitting) return
    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, submitting])

  const handleSelect = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!test) return
    const answeredCount = Object.keys(answers).length
    if (!isAutoSubmit && answeredCount < test.questions.length) {
      const unanswered = test.questions.length - answeredCount
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return
    }

    setSubmitting(true)
    try {
      const total = test.questions.length
      const correct = test.questions.filter((q, i) => answers[i] === q.correctAnswer).length
      const score = Math.round((correct / total) * 100)

      const answersArray = test.questions.map((_, i) => answers[i] || null)

      let aiFeedback = ''
      try {
        aiFeedback = await analyzePerformance(test.questions, answersArray)
      } catch (e) {
        aiFeedback = 'AI feedback unavailable. Please check your Gemini API key.'
      }

      const resultId = await saveResult({
        studentId: userProfile.id,
        studentName: userProfile.name,
        testId: id,
        testTitle: test.title,
        answers: answersArray,
        score,
        correct,
        total,
        aiFeedback,
      })

      navigate(`/result/${resultId}`)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg">

        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-body text-sm">Loading test…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen mesh-bg">

        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center card max-w-sm mx-4">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-red-400 font-body">{error || 'Test not found.'}</p>
          </div>
        </div>
      </div>
    )
  }

  const progress = (Object.keys(answers).length / test.questions.length) * 100

  return (
    <div className="min-h-screen mesh-bg">


      {/* Progress bar */}
      <div className="sticky top-16 z-40 h-0.5 bg-navy-800">
        <div
          className="h-full bg-gold-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Test header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="page-title mb-1">{test.title}</h1>
              <div className="flex items-center gap-2">
                <span className="badge-blue">{test.topic}</span>
                <span className="badge-gold">{test.difficulty}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
              <div>
                <p className="text-2xl font-display font-semibold text-white">
                  {Object.keys(answers).length}<span className="text-slate-500 text-base">/{test.questions.length}</span>
                </p>
                <p className="text-xs text-slate-500 font-body mt-0.5">answered</p>
              </div>
              {timeLeft !== null && (
                <div className={`px-3 py-1.5 rounded-lg border font-mono text-sm tracking-wider font-semibold animate-fade-in
                  ${timeLeft <= 60 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' 
                    : 'bg-gold-400/5 border-gold-400/20 text-gold-400'}`}>
                  ⏱ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {test.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-9 h-9 rounded-lg text-xs font-body font-medium transition-all border
                ${i === current
                  ? 'bg-gold-400 text-navy-950 border-gold-400'
                  : answers[i]
                    ? 'bg-gold-400/15 text-gold-400 border-gold-400/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <QuestionCard
            question={test.questions[current]}
            index={current}
            selectedAnswer={answers[current]}
            onSelect={(ans) => handleSelect(current, ans)}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {current < test.questions.length - 1 ? (
            <button
              onClick={() => setCurrent(c => Math.min(test.questions.length - 1, c + 1))}
              className="btn-primary"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                  Analysing…
                </>
              ) : '🎯 Submit Test'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}
