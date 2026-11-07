import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Dashboard() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resume')
        setResumes(res.data.resumes)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchResumes()
  }, [])

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length)
    : null

  const lastUpload = resumes.length
    ? new Date(resumes[0].createdAt).toLocaleDateString()
    : 'Never'

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-7 text-white shadow-xl shadow-indigo-900/20">
          <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h2>
            <p className="mt-1 text-indigo-100">
              Upload your resume to get AI-powered feedback and ATS score
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Resumes Analyzed',
              value: loading ? '...' : resumes.length,
              icon: '📄',
              from: 'from-indigo-500',
              to: 'to-indigo-400',
            },
            {
              label: 'Average ATS Score',
              value: loading ? '...' : avgScore ?? 'N/A',
              icon: '🎯',
              from: 'from-fuchsia-500',
              to: 'to-fuchsia-400',
            },
            {
              label: 'Last Upload',
              value: loading ? '...' : lastUpload,
              icon: '🕐',
              from: 'from-violet-500',
              to: 'to-violet-400',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.from} ${stat.to} text-lg shadow-md transition-transform group-hover:scale-110`}
                >
                  {stat.icon}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Get Started</h3>
          <Link
            to="/upload"
            className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50 to-fuchsia-50 p-6 transition-all hover:border-indigo-400 hover:shadow-md"
          >
            <span className="text-4xl transition-transform group-hover:scale-110">📤</span>
            <div>
              <p className="font-medium text-slate-700">Upload your resume</p>
              <p className="text-sm text-slate-500">
                Get instant ATS score and AI feedback
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Resumes */}
        {resumes.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Recent Resumes</h3>
            <div className="space-y-3">
              {resumes.slice(0, 5).map((resume) => (
                <Link
                  key={resume._id}
                  to={`/resume/${resume._id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{resume.filename}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                    resume.atsScore >= 70
                      ? 'bg-emerald-100 text-emerald-700'
                      : resume.atsScore >= 40
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {resume.atsScore ?? 'N/A'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
