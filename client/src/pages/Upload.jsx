import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

function Upload() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setError('')
    } else {
      setError('Only PDF files are allowed')
    }
  }

  const handleFileInput = (e) => {
    const selected = e.target.files[0]
    if (selected?.type === 'application/pdf') {
      setFile(selected)
      setError('')
    } else {
      setError('Only PDF files are allowed')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDescription', jobDescription)
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/resume/${res.data.resume.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 bg-clip-text text-2xl font-bold text-transparent">
            Upload Resume
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload your PDF resume to get an ATS score and AI feedback
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 transition-all ${
            dragOver
              ? 'scale-[1.01] border-indigo-400 bg-indigo-50 shadow-lg'
              : file
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-300 bg-white/80 backdrop-blur hover:border-indigo-300 hover:bg-indigo-50/40'
          }`}
        >
          <span className="text-5xl">{file ? '✅' : '📄'}</span>
          <p className="mt-4 text-base font-medium text-slate-700">
            {file ? file.name : 'Drag & drop your PDF here'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse'}
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="mt-4 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-transform hover:scale-105"
          >
            Browse File
          </label>
        </div>

        {/* Job Description */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Job Description{' '}
            <span className="font-normal text-slate-400">(optional but recommended)</span>
          </label>
          <p className="mb-3 text-xs text-slate-500">
            Paste the job description to get a match score and targeted keyword suggestions
          </p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            placeholder="Paste the job description here..."
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Upload Button */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? 'Analyzing resume...' : 'Upload & Analyze'}
          </button>
        )}
      </div>
    </Layout>
  )
}

export default Upload
