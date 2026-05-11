import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { AiOutlineBarChart, AiOutlineClockCircle } from 'react-icons/ai'
import { FiActivity, FiUsers } from 'react-icons/fi'
import { MdOutlineMonitorHeart } from 'react-icons/md'
import BMICalculator from '../components/BMICalculator'
import HealthTracker from '../components/HealthTracker'
import SymptomChecker from './SymptomChecker'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [summary, setSummary] = useState({ sessions: 0, messages: 0, health_records: 0, bmi_history: 0, symptom_reports: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bmi', label: 'BMI Calculator' },
    { id: 'tracker', label: 'Health Tracker' },
    { id: 'symptoms', label: 'Symptom Checker' },
  ]

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/api/dashboard/summary')
        setSummary(response.data.summary || {})
      } catch (err) {
        setError(err?.message || 'Unable to load dashboard summary. Please refresh and try again.')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-3xl bg-rose-100 px-4 py-2 text-sm transition hover:bg-rose-200"
          >
            Refresh Page
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[260px_1fr]">
        <aside className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
          <div className="mb-8 flex items-center gap-3 rounded-3xl bg-cyan-50/80 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-600 text-white">
              <FiUsers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">Profile</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{user?.name || 'User'}</p>
            </div>
          </div>

          <nav className="space-y-3 text-sm font-medium text-slate-700">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-3xl px-4 py-3 text-left transition ${
                  activeTab === tab.id
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'hover:bg-cyan-50 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Welcome</p>
                  <p className="mt-4 text-2xl font-semibold text-slate-950">HealthAI</p>
                  <p className="mt-2 text-sm text-slate-500">Your personal assistant</p>
                </div>
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Sessions</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.sessions}</p>
                  <p className="mt-2 text-sm text-slate-500">Chat sessions saved</p>
                </div>
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Health records</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.health_records}</p>
                  <p className="mt-2 text-sm text-slate-500">Records logged today</p>
                </div>
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">BMI History</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.bmi_history}</p>
                  <p className="mt-2 text-sm text-slate-500">BMI entries saved</p>
                </div>
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Symptom journals</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.symptom_reports}</p>
                  <p className="mt-2 text-sm text-slate-500">Reports captured</p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Health Summary</p>
                      <h2 className="mt-4 text-2xl font-semibold text-slate-950">Your Progress</h2>
                    </div>
                    <AiOutlineBarChart className="h-10 w-10 rounded-3xl bg-cyan-50 p-2 text-cyan-600" />
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: 'Wellness', value: 'Good', tone: 'text-green-600' },
                      { label: 'Activity', value: 'Active', tone: 'text-cyan-600' },
                      { label: 'Nutrition', value: 'Balanced', tone: 'text-blue-600' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                        <p className={`mt-3 text-lg font-semibold ${item.tone}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Quick Actions</p>
                      <h2 className="mt-4 text-2xl font-semibold text-slate-950">Get Started</h2>
                    </div>
                    <AiOutlineClockCircle className="h-10 w-10 rounded-3xl bg-cyan-50 p-2 text-cyan-600" />
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      onClick={() => setActiveTab('bmi')}
                      className="w-full rounded-3xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Calculate BMI
                    </button>
                    <button
                      onClick={() => setActiveTab('tracker')}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-200 hover:bg-cyan-50"
                    >
                      Track Health Data
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'bmi' && <BMICalculator />}

          {activeTab === 'tracker' && <HealthTracker />}

          {activeTab === 'symptoms' && <SymptomChecker />}
        </div>
      </div>
      )}
    </section>
  )
}

export default Dashboard

