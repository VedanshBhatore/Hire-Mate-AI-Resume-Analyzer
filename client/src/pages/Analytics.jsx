import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'

function Analytics() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resume')
        setResumes(res.data.resumes.reverse()) // oldest first for charts
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchResumes()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  if (resumes.length === 0) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <span className="text-6xl">📊</span>
          <h2 className="text-xl font-semibold text-slate-700">No data yet</h2>
          <p className="text-slate-500">Upload resumes to see your analytics</p>
        </div>
      </Layout>
    )
  }

  const chartData = resumes.map((r, i) => ({
    name: `Resume ${i + 1}`,
    score: r.atsScore || 0,
    date: new Date(r.createdAt).toLocaleDateString(),
  }))

  const avgScore = Math.round(
    resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length
  )
  const highestScore = Math.max(...resumes.map((r) => r.atsScore || 0))
  const lowestScore = Math.min(...resumes.map((r) => r.atsScore || 0))

  const getBarColor = (score) => {
    if (score >= 70) return '#10b981'
    if (score >= 40) return '#f59e0b'
    return '#f43f5e'
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 bg-clip-text text-2xl font-bold text-transparent">
            Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your resume improvement over time
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Resumes', value: resumes.length, icon: '📄', from: 'from-indigo-500', to: 'to-indigo-400' },
            { label: 'Average Score', value: avgScore, icon: '📊', from: 'from-violet-500', to: 'to-violet-400' },
            { label: 'Highest Score', value: highestScore, icon: '🏆', from: 'from-emerald-500', to: 'to-emerald-400' },
            { label: 'Lowest Score', value: lowestScore, icon: '📉', from: 'from-rose-500', to: 'to-rose-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.from} ${stat.to} text-base shadow-md transition-transform group-hover:scale-110`}
                >
                  {stat.icon}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Line Chart - Score Trend */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h3 className="mb-6 text-lg font-semibold text-slate-800">
            ATS Score Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="scoreLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                formatter={(value) => [`${value}`, 'ATS Score']}
                labelFormatter={(label) => label}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="url(#scoreLine)"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Score per Resume */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h3 className="mb-6 text-lg font-semibold text-slate-800">
            Score Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                formatter={(value) => [`${value}`, 'ATS Score']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resume History Table */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Resume History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">#</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Filename</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Date</th>
                  <th className="pb-3 text-left font-medium text-slate-500">ATS Score</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume, i) => (
                  <tr key={resume._id} className="border-b border-slate-50 transition-colors hover:bg-indigo-50/40">
                    <td className="py-3 text-slate-400">{i + 1}</td>
                    <td className="py-3 font-medium text-slate-800">{resume.filename}</td>
                    <td className="py-3 text-slate-500">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        resume.atsScore >= 70
                          ? 'bg-emerald-100 text-emerald-700'
                          : resume.atsScore >= 40
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {resume.atsScore ?? 'N/A'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                        {resume.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Analytics
