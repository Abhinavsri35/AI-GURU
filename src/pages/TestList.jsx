import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTestByCode, getResultsByStudent } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function TestList() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { userProfile } = useAuth()

  const handleJoin = async (e) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return
    if (cleanCode.length !== 6) {
      setError('Test code must be 6 characters long.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // 1. Find the test by code
      const test = await getTestByCode(cleanCode)
      if (!test) {
        setError('No test found with this code. Please check and try again.')
        setLoading(false)
        return
      }

      if (!test.published) {
        setError('This test is not currently published or available.')
        setLoading(false)
        return
      }

      const results = await getResultsByStudent(userProfile.id)
      const existingAttempt = results.find(r => r.testId === test.id)

      if (existingAttempt) {
        navigate(`/result/${existingAttempt.id}`)
      } else {
        navigate(`/student/test/${test.id}`)
      }

    } catch (err) {
      console.error(err)
      setError('An error occurred while joining the test.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/5 to-transparent" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10 -mt-20">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
              <span className="text-gold-400 text-2xl">🔐</span>
            </div>
          </div>
          <h1 className="text-2xl font-display font-semibold text-white">Join a Test</h1>
          <p className="text-slate-400 font-body text-sm mt-2">Enter the 6-character code provided by your teacher.</p>
        </div>

        <div className="card shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="label text-center block mb-3">Test Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="input text-center text-3xl font-mono tracking-[0.5em] py-4 shadow-inner bg-navy-950/50 uppercase placeholder:text-white/10"
                placeholder="XXXXXX"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                  Locating Test…
                </>
              ) : (
                <>Enter Test →</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 font-body">
              Are you a teacher? <br className="sm:hidden" /> Codes are generated in your dashboard automatically.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
