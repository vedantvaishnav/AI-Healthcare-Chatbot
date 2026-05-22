import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  AiOutlineBarChart,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineWarning,
} from 'react-icons/ai'
import { FiActivity, FiUsers, FiDroplet, FiActivity as FiWorkout } from 'react-icons/fi'
import { MdOutlineMonitorHeart, MdOutlineLocalFireDepartment } from 'react-icons/md'
import BMICalculator from '../components/BMICalculator'
import HealthTracker from '../components/HealthTracker'
import SymptomChecker from './SymptomChecker'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [summary, setSummary] = useState({
    sessions: 0,
    messages: 0,
    health_records: 0,
    bmi_history: 0,
    symptom_reports: 0,
  })
  const [healthProfile, setHealthProfile] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    fitnessGoal: 'maintenance',
    metrics: null,
  })
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

        // Try to fetch from API
        const response = await api.get('/api/dashboard/summary')
        setSummary(response.data.summary || {})

        // Also load health profile from localStorage if available
        const storedProfile = localStorage.getItem('healthProfile')
        if (storedProfile) {
          setHealthProfile(JSON.parse(storedProfile))
        }
      } catch (err) {
        // If API fails, still try to load from localStorage
        const storedProfile = localStorage.getItem('healthProfile')
        if (storedProfile) {
          setHealthProfile(JSON.parse(storedProfile))
        } else {
          setError(
            'No health profile found. Please complete your health profile in the Chatbot page first.'
          )
        }
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  // Generate daily routine based on profile
  const generateDailyRoutine = () => {
    if (!healthProfile?.metrics?.sleep) return []

    const routine = [
      { time: '6:00 AM', activity: 'Wake up', icon: '🌅' },
      { time: '6:30 AM', activity: 'Drink water (500ml)', icon: '💧' },
    ]

    if (
      healthProfile?.activityLevel === 'active' ||
      healthProfile?.activityLevel === 'very_active'
    ) {
      routine.push({ time: '7:00 AM', activity: 'Morning Exercise (30-45 min)', icon: '🏃' })
    }

    routine.push(
      { time: '8:00 AM', activity: 'Healthy Breakfast', icon: '🥣' },
      { time: '10:00 AM', activity: 'Drink water + snack', icon: '💧' },
      { time: '12:30 PM', activity: 'Lunch meal', icon: '🍽️' },
      { time: '3:00 PM', activity: 'Drink water', icon: '💧' },
      { time: '5:00 PM', activity: 'Light snack', icon: '🥤' },
      {
        time: `${
          healthProfile?.metrics?.sleep === 9
            ? '9:30'
            : healthProfile?.metrics?.sleep === 8
              ? '10:00'
              : '10:30'
        } PM`,
        activity: 'Prepare for bed',
        icon: '😴',
      }
    )

    return routine
  }

  const getMetricColor = (category) => {
    const colors = {
      Underweight: 'from-blue-50 to-blue-100',
      Normal: 'from-green-50 to-emerald-100',
      Overweight: 'from-amber-50 to-orange-100',
      Obese: 'from-rose-50 to-red-100',
    }
    return colors[category] || 'from-slate-50 to-slate-100'
  }

  const getMetricBorder = (category) => {
    const borders = {
      Underweight: 'border-blue-300',
      Normal: 'border-green-300',
      Overweight: 'border-amber-300',
      Obese: 'border-rose-300',
    }
    return borders[category] || 'border-slate-300'
  }

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      )}

      {error && !healthProfile && (
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-700">
          <div className="flex items-start gap-3">
            <AiOutlineWarning className="mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{error}</p>
              <button
                onClick={() => (window.location.href = '/chatbot')}
                className="mt-4 rounded-3xl bg-amber-100 px-4 py-2 text-sm transition hover:bg-amber-200"
              >
                Go to Chatbot
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && healthProfile?.age && healthProfile?.metrics && (
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
                {/* Health Metrics Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* BMI */}
                  <div
                    className={`rounded-[2rem] border ${
                      healthProfile?.metrics?.bmiCategory
                        ? getMetricBorder(healthProfile.metrics.bmiCategory)
                        : 'border-slate-300'
                    } bg-gradient-to-br ${
                      healthProfile?.metrics?.bmiCategory
                        ? getMetricColor(healthProfile.metrics.bmiCategory)
                        : 'from-slate-50 to-slate-100'
                    } p-6 shadow-glass`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
                      BMI Score
                    </p>
                    <p className="mt-4 text-4xl font-bold text-slate-950">
                      {healthProfile?.metrics?.bmi || 'N/A'}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {healthProfile?.metrics?.bmiCategory || 'Not Calculated'}
                    </p>
                  </div>

                  {/* Daily Calories */}
                  <div className="rounded-[2rem] border border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 p-6 shadow-glass">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
                        Daily Calories
                      </p>
                      <MdOutlineLocalFireDepartment className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="mt-4 text-4xl font-bold text-slate-950">
                      {healthProfile?.metrics?.calories?.maintenance || 'N/A'}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">kcal (Maintenance)</p>
                  </div>

                  {/* Water Intake */}
                  <div className="rounded-[2rem] border border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-100 p-6 shadow-glass">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
                        Water Daily
                      </p>
                      <FiDroplet className="h-5 w-5 text-cyan-600" />
                    </div>
                    <p className="mt-4 text-4xl font-bold text-slate-950">
                      {healthProfile?.metrics?.water || 'N/A'}L
                    </p>
                    <p className="mt-2 text-xs text-slate-600">Recommended</p>
                  </div>

                  {/* Sleep */}
                  <div className="rounded-[2rem] border border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-100 p-6 shadow-glass">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
                      Sleep Duration
                    </p>
                    <p className="mt-4 text-4xl font-bold text-slate-950">
                      {healthProfile?.metrics?.sleep || 'N/A'}hrs
                    </p>
                    <p className="mt-2 text-xs text-slate-600">Per night</p>
                  </div>
                </div>

                {/* Personalized Data */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Health Profile Summary */}
                  <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                      Your Profile
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">Health Details</h2>

                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between border-b border-slate-100 pb-3">
                        <span className="text-slate-600">Age</span>
                        <span className="font-semibold text-slate-950">{healthProfile?.age || 'N/A'} years</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-3">
                        <span className="text-slate-600">Gender</span>
                        <span className="font-semibold text-slate-950 capitalize">
                          {healthProfile?.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-3">
                        <span className="text-slate-600">Height</span>
                        <span className="font-semibold text-slate-950">
                          {healthProfile?.height || 'N/A'} cm
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-3">
                        <span className="text-slate-600">Weight</span>
                        <span className="font-semibold text-slate-950">
                          {healthProfile?.weight || 'N/A'} kg
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-3">
                        <span className="text-slate-600">Activity Level</span>
                        <span className="font-semibold text-slate-950 capitalize">
                          {healthProfile?.activityLevel?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fitness Goal</span>
                        <span className="font-semibold text-slate-950 capitalize">
                          {healthProfile?.fitnessGoal?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calorie Details */}
                  <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                      Calorie Breakdown
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">Your Needs</h2>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl bg-amber-50 p-4">
                        <p className="text-sm text-amber-600">Maintenance (Your current)</p>
                        <p className="mt-2 text-2xl font-bold text-amber-900">
                          {healthProfile?.metrics?.calories?.maintenance || 'N/A'}
                        </p>
                        <p className="mt-1 text-xs text-amber-700">kcal per day</p>
                      </div>

                      <div className="rounded-2xl bg-green-50 p-4">
                        <p className="text-sm text-green-600">Weight Gain Goal</p>
                        <p className="mt-2 text-2xl font-bold text-green-900">
                          {healthProfile?.metrics?.calories?.gain || 'N/A'}
                        </p>
                        <p className="mt-1 text-xs text-green-700">kcal per day (+20%)</p>
                      </div>

                      <div className="rounded-2xl bg-rose-50 p-4">
                        <p className="text-sm text-rose-600">Weight Loss Goal</p>
                        <p className="mt-2 text-2xl font-bold text-rose-900">
                          {healthProfile?.metrics?.calories?.loss || 'N/A'}
                        </p>
                        <p className="mt-1 text-xs text-rose-700">kcal per day (-20%)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Routine */}
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                    Daily Routine
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950">Your Personalized Schedule</h2>

                  <div className="mt-6 space-y-3">
                    {generateDailyRoutine().map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-cyan-50"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-950">{item.activity}</p>
                          <p className="text-sm text-slate-500">{item.time}</p>
                        </div>
                        <AiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Summary */}
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                      Sessions
                    </p>
                    <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.sessions}</p>
                    <p className="mt-2 text-sm text-slate-500">Chat sessions saved</p>
                  </div>
                  <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                      BMI Records
                    </p>
                    <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.bmi_history}</p>
                    <p className="mt-2 text-sm text-slate-500">BMI entries saved</p>
                  </div>
                  <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-glass">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                      Symptom Reports
                    </p>
                    <p className="mt-4 text-3xl font-semibold text-slate-950">{summary.symptom_reports}</p>
                    <p className="mt-2 text-sm text-slate-500">Reports captured</p>
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

