// src/pages/GenerateTest.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import { useAuth } from '../context/AuthContext'
import { generateQuestions } from '../services/aiService'
import { createTest } from '../firebase/firestore'

const difficulties = ['Easy', 'Medium', 'Hard']
const questionCounts = [3, 5, 8, 10]

const steps = ['Configure', 'Review & Edit', 'Publish']

export default function GenerateTest() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ topic: '', title: '', difficulty: 'Medium', count: 5 })
  const [questions, setQuestions] = useState([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    setGenerating(true)
    try {
      const qs = await generateQuestions(form.topic, form.difficulty, form.count)
      setQuestions(qs)
      setStep(1)
    } catch (err) {
      setError('AI generation failed. Check your Gemini API key and try again.')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions]
    const opts = [...updated[qIndex].options]
    opts[optIndex] = value
    updated[qIndex] = { ...updated[qIndex], options: opts }
    setQuestions(updated)
  }

  const handlePublish = async (publish) => {
    setSaving(true)
    try {
      const testId = await createTest({
        title: form.title || `${form.topic} — ${form.difficulty}`,
        topic: form.topic,
        difficulty: form.difficulty,
        questions,
        createdBy: userProfile.id,
        published: publish,
      })
      navigate('/teacher/dashboard')
    } catch (err) {
      setError('Failed to save test. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="page-title mb-1">Generate AI Test</h1>
          <p className="text-slate-400 font-body text-sm">Powered by Google Gemini</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all
                ${i === step ? 'bg-gold-400/15 text-gold-400 border border-gold-400/30' :
                  i < step ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                  'bg-white/5 text-slate-500 border border-white/10'}`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs border border-current">
                  {i < step ? '✓' : i + 1}
                </span>
                {s}
              </div>
              {i < steps.length - 1 && <div className="w-6 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        {/* Step 0: Configure */}
        {step === 0 && (
          <div className="card animate-slide-up">
            <h2 className="section-title mb-6">Test Configuration</h2>
            <form onSubmit={handleGenerate} className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Test title <span className="text-slate-500">(optional)</span></label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="input"
                    placeholder="e.g. Operating System Mid-Term Quiz"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Topic <span className="text-red-400">*</span></label>
                  <input
                    value={form.topic}
                    onChange={e => setForm({ ...form, topic: e.target.value })}
                    className="input"
                    placeholder="e.g. Operating System, Data Structures, Photosynthesis…"
                    required
                  />
                </div>

                <div>
                  <label className="label">Difficulty</label>
                  <div className="flex gap-2">
                    {difficulties.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, difficulty: d })}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-body font-medium transition-all
                          ${form.difficulty === d
                            ? 'border-gold-400/60 bg-gold-400/10 text-gold-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Number of questions</label>
                  <div className="flex gap-2">
                    {questionCounts.map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, count: n })}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-body font-medium transition-all
                          ${form.count === n
                            ? 'border-gold-400/60 bg-gold-400/10 text-gold-400'
                            : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm font-body">
                  Generating <strong className="text-slate-300">{form.count} {form.difficulty}</strong> questions on <strong className="text-slate-300">{form.topic || '…'}</strong>
                </p>
                <button
                  type="submit"
                  disabled={generating || !form.topic.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>✨ Generate with AI</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 1: Review & Edit */}
        {step === 1 && (
          <div className="animate-slide-up space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h2 className="section-title">Review Questions</h2>
                <span className="badge-gold">{questions.length} questions</span>
              </div>
              <p className="text-slate-400 text-sm font-body">
                Edit any question, option, or correct answer before publishing.
              </p>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="card space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-gold">Q{qi + 1}</span>
                  <span className="text-xs text-slate-500 font-body">Edit below</span>
                </div>

                <div>
                  <label className="label">Question text</label>
                  <textarea
                    rows={2}
                    value={q.questionText}
                    onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                    className="input resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi}>
                      <label className="label text-xs">
                        Option {String.fromCharCode(65 + oi)}
                        {opt === q.correctAnswer && (
                          <span className="ml-2 text-emerald-400">✓ Correct</span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          className="input text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuestion(qi, 'correctAnswer', opt)}
                          title="Mark as correct"
                          className={`px-3 rounded-xl border text-xs font-body transition-all flex-shrink-0
                            ${opt === q.correctAnswer
                              ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400'
                              : 'border-white/10 text-slate-500 hover:border-white/20'}`}
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(0)} className="btn-ghost">← Back</button>
              <button onClick={() => setStep(2)} className="btn-primary">Review & Publish →</button>
            </div>
          </div>
        )}

        {/* Step 2: Publish */}
        {step === 2 && (
          <div className="card animate-slide-up">
            <h2 className="section-title mb-6">Publish Test</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-400 font-body text-sm">Title</span>
                <span className="text-white font-body text-sm font-medium">{form.title || `${form.topic} — ${form.difficulty}`}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-400 font-body text-sm">Topic</span>
                <span className="text-white font-body text-sm font-medium">{form.topic}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-400 font-body text-sm">Difficulty</span>
                <span className="badge-gold">{form.difficulty}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-400 font-body text-sm">Questions</span>
                <span className="text-white font-body text-sm font-medium">{questions.length}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost">← Back</button>
              <button
                onClick={() => handlePublish(false)}
                disabled={saving}
                className="btn-secondary flex-1"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handlePublish(true)}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving
                  ? <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Saving…</>
                  : '🚀 Publish Test'
                }
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
