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
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
          <h2 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h2>
          <p className="mt-1 text-blue-100">
            Upload your resume to get AI-powered feedback and ATS score
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Resumes Analyzed',
              value: loading ? '...' : resumes.length,
              icon: '📄',
            },
            {
              label: 'Average ATS Score',
              value: loading ? '...' : avgScore ?? 'N/A',
              icon: '🎯',
            },
            {
              label: 'Last Upload',
              value: loading ? '...' : lastUpload,
              icon: '🕐',
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Get Started</h3>
          <Link
            to="/upload"
            className="flex items-center gap-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 hover:border-blue-400 hover:bg-blue-100 transition-colors"
          >
            <span className="text-4xl">📤</span>
            <div>
              <p className="font-medium text-gray-700">Upload your resume</p>
              <p className="text-sm text-gray-500">
                Get instant ATS score and AI feedback
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Resumes */}
        {resumes.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Recent Resumes</h3>
            <div className="space-y-3">
              {resumes.slice(0, 5).map((resume) => (
                <Link
                  key={resume._id}
                  to={`/resume/${resume._id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{resume.filename}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                    resume.atsScore >= 70
                      ? 'bg-green-100 text-green-700'
                      : resume.atsScore >= 40
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
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