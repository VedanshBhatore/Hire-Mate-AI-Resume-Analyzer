import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

function ScoreRing({ score }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(score, 100) / 100)
  const stroke = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e'
  const textColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-rose-600'

  return (
    <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <span className={`absolute text-3xl font-bold ${textColor}`}>{score}</span>
    </div>
  )
}

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
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="mt-4 text-slate-500">Analyzing your resume...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="rounded-xl bg-rose-50 p-6 text-rose-600">{error}</div>
      </Layout>
    )
  }

  const { atsScore, feedback, filename } = resume
  const aiFeedback = feedback?.ai
  const atsFeedback = feedback?.ats

  const scoreColor =
    atsScore >= 70 ? 'text-emerald-600' : atsScore >= 40 ? 'text-amber-600' : 'text-rose-600'
  const scoreBg =
    atsScore >= 70
      ? 'from-emerald-50 to-white'
      : atsScore >= 40
      ? 'from-amber-50 to-white'
      : 'from-rose-50 to-white'

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 bg-clip-text text-2xl font-bold text-transparent">
              Resume Analysis
            </h2>
            <p className="mt-1 text-sm text-slate-500">{filename}</p>
          </div>
          <Link
            to="/upload"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105"
          >
            Upload New Resume
          </Link>
        </div>

        {/* ATS Score Card */}
        <div className={`rounded-3xl border border-slate-100 bg-gradient-to-br ${scoreBg} p-6 shadow-sm`}>
          <div className="flex items-center gap-6">
            <ScoreRing score={atsScore} />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">ATS Score</h3>
              <p className={`text-sm font-medium ${scoreColor}`}>
                {atsScore >= 70 ? 'Strong resume — likely to pass ATS filters' : atsScore >= 40 ? 'Average — needs some improvements' : 'Weak — significant improvements needed'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Based on keyword presence, formatting, and structure analysis
              </p>
            </div>
          </div>
        </div>

        {/* AI Overall Feedback */}
        {aiFeedback?.overallFeedback && (
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <span>🤖</span> AI Assessment
            </h3>
            <p className="leading-relaxed text-slate-600">{aiFeedback.overallFeedback}</p>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h3 className="mb-3 text-lg font-semibold text-emerald-700">✅ Strengths</h3>
            <ul className="space-y-2">
              {aiFeedback?.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-emerald-500">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h3 className="mb-3 text-lg font-semibold text-amber-700">⚠️ Improvements</h3>
            <ul className="space-y-2">
              {aiFeedback?.improvements?.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-amber-500">•</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Missing Keywords */}
        {aiFeedback?.missingKeywords?.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {aiFeedback.missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section Detection */}
        {atsFeedback?.sections && (
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Section Detection</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(atsFeedback.sections).map(([section, found]) => (
                <div
                  key={section}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                    found ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
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
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h3 className="mb-3 text-lg font-semibold text-slate-800">Formatting Tips</h3>
            <ul className="space-y-2">
              {aiFeedback.formattingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-indigo-500">💡</span>
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
