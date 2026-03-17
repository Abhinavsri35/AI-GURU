// src/pages/TestList.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getAllPublishedTests } from '../firebase/firestore'

const difficultyColor = {
  Easy: 'badge-green',
  Medium: 'badge-gold',
  Hard: 'badge-red',
}

export default function TestList() {
  const [tests, setTests] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('All')

  useEffect(() => {
    getAllPublishedTests()
      .then(data => { setTests(data); setFiltered(data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = tests
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.topic?.toLowerCase().includes(q)
      )
    }
    if (diffFilter !== 'All') {
      result = result.filter(t => t.difficulty === diffFilter)
    }
    setFiltered(result)
  }, [search, diffFilter, tests])

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8 animate-fade-in">
          <h1 className="page-title mb-1">Available Tests</h1>
          <p className="text-slate-400 font-body text-sm">Choose a test to attempt</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input flex-1"
            placeholder="Search by topic or title…"
          />
          <div className="flex gap-2">
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-body font-medium transition-all
                  ${diffFilter === d
                    ? 'border-gold-400/60 bg-gold-400/10 text-gold-400'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Test Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-44 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 font-body">No tests match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
            {filtered.map(test => (
              <div key={test.id} className="card group hover:border-gold-400/20 transition-all duration-200 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className={difficultyColor[test.difficulty] || 'badge-gold'}>
                    {test.difficulty}
                  </span>
                  <span className="text-slate-500 text-xs font-body">
                    {test.questions?.length || 0} Qs
                  </span>
                </div>

                <h3 className="text-white font-body font-semibold text-base mb-1 leading-snug flex-1">
                  {test.title}
                </h3>
                <p className="text-slate-400 font-body text-sm mb-4">{test.topic}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500 font-body">
                    {test.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                  </span>
                  <Link
                    to={`/student/test/${test.id}`}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Start →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
