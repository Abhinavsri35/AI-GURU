import { useEffect, useState } from 'react'
import { getAllPublishedTests, getAllResults } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function Leaderboard() {
  const { userProfile } = useAuth()
  const [results, setResults] = useState([])
  const [tests, setTests] = useState([])
  const [filter, setFilter] = useState('overall')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllResults(), getAllPublishedTests()])
      .then(([allRes, allTests]) => {
        setResults(allRes)
        setTests(allTests)
      })
      .catch((err) => console.error("Failed to load leaderboard data", err))
      .finally(() => setLoading(false))
  }, [])

  const getLeaderboardData = () => {
    let data = []

    if (filter === 'overall') {
      const studentMap = {}
      results.forEach(r => {
        if (!studentMap[r.studentId]) {
          studentMap[r.studentId] = { studentName: r.studentName, totalScore: 0, testsTaken: 0 }
        }
        studentMap[r.studentId].totalScore += (r.score || 0)
        studentMap[r.studentId].testsTaken += 1
      })
      
      data = Object.values(studentMap).map(s => ({
        name: s.studentName,
        score: Math.round(s.totalScore / s.testsTaken),
        meta: `${s.testsTaken} test(s) taken`
      }))
    } else {
      const testResults = results.filter(r => r.testId === filter)
      data = testResults.map(r => ({
        name: r.studentName,
        score: r.score || 0,
        meta: `Submitted: ${r.submittedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}`
      }))
    }

    // Sort heavily specifically: "ascending order"
    data.sort((a, b) => a.score - b.score)

    return data
  }

  const leaderboardData = getLeaderboardData()

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in w-full">
      
      <div className="mb-8">
        <h1 className="page-title mb-1">Leaderboard</h1>
        <p className="text-slate-400 font-body text-sm">See how students are performing.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex bg-navy-900 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          <button
            onClick={() => setFilter('overall')}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-body font-medium transition-all ${
              filter === 'overall' 
                ? 'bg-gold-400 text-navy-950 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Overall Score
          </button>
          <div className="w-px bg-white/5 mx-1 my-2 shrink-0" />
          <select
            value={filter !== 'overall' ? filter : ''}
            onChange={(e) => {
              const val = e.target.value
              setFilter(val ? val : 'overall')
            }}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-body font-medium transition-all outline-none appearance-none cursor-pointer ${
              filter !== 'overall'
                ? 'bg-gold-400 text-navy-950 shadow-sm'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <option value="" disabled className="bg-navy-950 text-white">Select a Test...</option>
            <option value="overall" className="bg-navy-950 text-white">--- Subject-wise filter ---</option>
            {tests.map(t => (
              <option key={t.id} value={t.id} className="bg-navy-950 text-white">
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card w-full overflow-hidden p-0 animate-slide-up">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-12 rounded-xl w-full" />)}
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block">🏆</span>
            <p className="text-slate-400 font-body">No data available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-body font-medium text-slate-500 uppercase tracking-widest w-24">Rank</th>
                  <th className="py-4 px-6 text-xs font-body font-medium text-slate-500 uppercase tracking-widest">Student</th>
                  <th className="py-4 px-6 text-xs font-body font-medium text-slate-500 uppercase tracking-widest text-right">Score</th>
                  <th className="py-4 px-6 text-xs font-body font-medium text-slate-500 uppercase tracking-widest text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboardData.map((row, index) => (
                  <tr 
                    key={`${row.name}-${index}`} 
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-body
                        ${index === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 
                          index === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' : 
                          index === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' : 
                          'bg-white/5 text-slate-400'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-medium text-xs">
                          {row.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-white font-body font-medium">{row.name || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-lg font-display font-semibold text-gold-400">
                        {row.score}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-slate-500 font-body">
                      {row.meta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
