import { useEffect, useState } from 'react'
import api from '../services/api'

function SymptomChecker() {
  const [summary, setSummary] = useState('')
  const [details, setDetails] = useState('')
  const [severity, setSeverity] = useState('moderate')
  const [duration, setDuration] = useState('')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/symptoms')
      setReports(response.data.reports || [])
    } catch (err) {
      console.error('Unable to fetch symptom reports', err)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await api.post('/api/symptoms', {
        summary,
        details,
        severity,
        duration,
      })
      setSummary('')
      setDetails('')
      setDuration('')
      setSeverity('moderate')
      setMessage({ type: 'success', text: 'Symptom report saved successfully.' })
      fetchReports()
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Unable to save symptom report.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Symptom Checker</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Log your symptoms and track changes</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Short summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              placeholder="Headache and mild nausea"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows={4}
              placeholder="Describe how long the symptoms have lasted and any triggers."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Severity
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Duration
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2 days"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save report'}
            </button>
            {message && (
              <span className={`text-sm ${message.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{message.text}</span>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950">Recent symptom logs</h3>
          <button
            type="button"
            onClick={fetchReports}
            className="rounded-3xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="text-sm text-slate-500">No symptom reports have been saved yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                  <span className="uppercase tracking-[0.3em] text-cyan-600">{report.severity}</span>
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 font-semibold text-slate-900">{report.summary}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{report.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SymptomChecker
