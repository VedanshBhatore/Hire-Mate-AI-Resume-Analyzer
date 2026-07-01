import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

function ResumeResult() {
  const { id } = useParams()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get(`/resume/${id}`)
        setResume(res.data.resume)
      } catch {
        setError('Failed to load resume results')
      } finally {
        setLoading(false)
      }
    }
    fetchResume()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="mt-4 text-gray-500">Analyzing your resume...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="rounded-lg bg-red-50 p-6 text-red-600">{error}</div>
      </Layout>
    )
  }

  const { atsScore, feedback, filename } = resume
  const aiFeedback = feedback?.ai
  const atsFeedback = feedback?.ats

  const scoreColor =
    atsScore >= 70 ? 'text-green-600' : atsScore >= 40 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg =
    atsScore >= 70 ? 'bg-green-50' : atsScore >= 40 ? 'bg-yellow-50' : 'bg-red-50'
  const scoreRing =
    atsScore >= 70 ? 'border-green-400' : atsScore >= 40 ? 'border-yellow-400' : 'border-red-400'

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resume Analysis</h2>
            <p className="mt-1 text-sm text-gray-500">{filename}</p>
          </div>
          <Link
            to="/upload"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload New Resume
          </Link>
        </div>

        {/* ATS Score Card */}
        <div className={`rounded-2xl ${scoreBg} p-6`}>
          <div className="flex items-center gap-6">
            <div
              className={`flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 ${scoreRing} bg-white`}
            >
              <span className={`text-3xl font-bold ${scoreColor}`}>{atsScore}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">ATS Score</h3>
              <p className={`text-sm font-medium ${scoreColor}`}>
                {atsScore >= 70 ? 'Strong resume — likely to pass ATS filters' : atsScore >= 40 ? 'Average — needs some improvements' : 'Weak — significant improvements needed'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Based on keyword presence, formatting, and structure analysis
              </p>
            </div>
          </div>
        </div>

        {/* AI Overall Feedback */}
        {aiFeedback?.overallFeedback && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">AI Assessment</h3>
            <p className="text-gray-600 leading-relaxed">{aiFeedback.overallFeedback}</p>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-green-700">✅ Strengths</h3>
            <ul className="space-y-2">
              {aiFeedback?.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 text-green-500">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-orange-700">⚠️ Improvements</h3>
            <ul className="space-y-2">
              {aiFeedback?.improvements?.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 text-orange-500">•</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Missing Keywords */}
        {aiFeedback?.missingKeywords?.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {aiFeedback.missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section Detection */}
        {atsFeedback?.sections && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Section Detection</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(atsFeedback.sections).map(([section, found]) => (
                <div
                  key={section}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                    found ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {found ? '✓' : '✗'} {section}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formatting Tips */}
        {aiFeedback?.formattingTips?.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Formatting Tips</h3>
            <ul className="space-y-2">
              {aiFeedback.formattingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ResumeResult