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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  if (resumes.length === 0) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <span className="text-6xl">📊</span>
          <h2 className="text-xl font-semibold text-gray-700">No data yet</h2>
          <p className="text-gray-500">Upload resumes to see your analytics</p>
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
    if (score >= 70) return '#22c55e'
    if (score >= 40) return '#eab308'
    return '#ef4444'
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track your resume improvement over time
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Resumes', value: resumes.length, icon: '📄' },
            { label: 'Average Score', value: avgScore, icon: '📊' },
            { label: 'Highest Score', value: highestScore, icon: '🏆' },
            { label: 'Lowest Score', value: lowestScore, icon: '📉' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Line Chart - Score Trend */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-800">
            ATS Score Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value}`, 'ATS Score']}
                labelFormatter={(label) => label}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Score per Resume */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-800">
            Score Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value}`, 'ATS Score']}
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
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Resume History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left font-medium text-gray-500">#</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Filename</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Date</th>
                  <th className="pb-3 text-left font-medium text-gray-500">ATS Score</th>
                  <th className="pb-3 text-left font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume, i) => (
                  <tr key={resume._id} className="border-b border-gray-50">
                    <td className="py-3 text-gray-400">{i + 1}</td>
                    <td className="py-3 font-medium text-gray-800">{resume.filename}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        resume.atsScore >= 70
                          ? 'bg-green-100 text-green-700'
                          : resume.atsScore >= 40
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {resume.atsScore ?? 'N/A'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
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