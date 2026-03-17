// src/pages/TeacherDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getTestsByTeacher, getResultsByTest } from '../firebase/firestore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const StatCard = ({ label, value, icon, color = 'gold' }) => {
  const colorMap = {
    gold: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-body uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-display font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-navy-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-slate-400 font-body mb-1">{label}</p>
        <p className="text-white font-semibold font-body">{payload[0].value.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export default function TeacherDashboard() {
  const { userProfile } = useAuth()
  const [tests, setTests] = useState([])
  const [chartData, setChartData] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return
      try {
        const myTests = await getTestsByTeacher(userProfile.id)
        setTests(myTests)

        let allResults = []
        for (const test of myTests) {
          const results = await getResultsByTest(test.id)
          allResults = [...allResults, ...results]
        }

        setTotalStudents(new Set(allResults.map(r => r.studentId)).size)

        if (allResults.length > 0) {
          const avg = allResults.reduce((sum, r) => sum + (r.score || 0), 0) / allResults.length
          setAvgScore(Math.round(avg))
        }

        // Build chart data: avg score per test
        const data = await Promise.all(
          myTests.slice(0, 6).map(async (test) => {
            const results = await getResultsByTest(test.id)
            const avg = results.length
              ? results.reduce((s, r) => s + (r.score || 0), 0) / results.length
              : 0
            return {
              name: test.title.length > 12 ? test.title.slice(0, 12) + '…' : test.title,
              score: parseFloat(avg.toFixed(1)),
              count: results.length,
            }
          })
        )
        setChartData(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userProfile])

  return (
    <div className="min-h-screen mesh-bg">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <p className="text-slate-400 font-body text-sm mb-1">Good day,</p>
          <h1 className="page-title">{userProfile?.name || 'Teacher'}</h1>
          <p className="text-slate-400 font-body mt-2 text-sm">
            Here's an overview of your classroom activity.
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-slide-up">
            <StatCard label="Total Tests" value={tests.length} icon="📋" color="gold" />
            <StatCard label="Students Reached" value={totalStudents} icon="🎓" color="blue" />
            <StatCard label="Average Score" value={`${avgScore}%`} icon="📊" color="green" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Chart */}
          <div className="lg:col-span-3 card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Test Performance</h2>
              <span className="text-xs text-slate-500 font-body">Avg score %</span>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8899bb', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8899bb', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#fbbf24' : '#f59e0b'} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <p className="text-slate-500 font-body text-sm">No test data yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 card flex flex-col">
            <h2 className="section-title mb-6">Quick Actions</h2>
            <div className="space-y-3 flex-1">
              <Link
                to="/teacher/generate-test"
                className="flex items-center gap-4 p-4 rounded-xl border border-gold-400/20 bg-gold-400/5 hover:bg-gold-400/10 hover:border-gold-400/40 transition-all duration-150 group"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-400/20 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <div>
                  <p className="text-white font-body font-medium text-sm">Create Test</p>
                  <p className="text-slate-500 text-xs font-body mt-0.5">Create MCQs with Gemini</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Tests Table */}
        <div className="card mt-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Your Tests</h2>
            <Link to="/teacher/generate-test" className="btn-secondary text-sm py-2 px-4">+ New Test</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-400 font-body">No tests yet.</p>
              <Link to="/teacher/generate-test" className="btn-primary mt-4 inline-block text-sm">
                Create your first test
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Subject Title', 'Topic', 'Questions', 'Status', 'Created'].map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-body font-medium text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="text-white font-body font-medium text-sm">{test.title}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="badge-blue">{test.topic}</span>
                      </td>
                      <td className="py-4 pr-4 text-slate-400 font-body text-sm">{test.questions?.length || 0}</td>
                      <td className="py-4 pr-4">
                        {test.published
                          ? <span className="badge-green">Published</span>
                          : <span className="badge bg-slate-500/10 text-slate-400 border border-slate-500/20">Draft</span>
                        }
                      </td>
                      <td className="py-4 text-slate-400 font-body text-sm">
                        {test.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
