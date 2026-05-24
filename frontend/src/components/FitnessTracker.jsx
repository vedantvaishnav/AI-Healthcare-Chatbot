import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { storage } from '../services/storage'
import { FaTint } from 'react-icons/fa'
import { FiActivity, FiMoon } from 'react-icons/fi'

function FitnessTracker() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [healthProfile, setHealthProfile] = useState(null)

  const [inputs, setInputs] = useState({
    water: '',
    waterUnit: 'ml',
    exercise: '',
    exerciseUnit: 'min',
    sleep: '',
  })

  useEffect(() => {
    if (user) {
      loadProfile()
      fetchSummary()
    }
  }, [user, selectedDate])

  const loadProfile = () => {
    const stored = storage.getItem('healthProfile', user) || storage.getItem('healthProfile', 'guest')
    if (stored) {
      setHealthProfile(JSON.parse(stored))
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/health-summary', {
        params: { date: selectedDate },
      })
      setSummary(response.data.summary || {})
    } catch (error) {
      console.error('Failed to fetch health summary:', error)
    }
  }

  const convertToMl = (value, unit) => {
    if (!value) return 0
    const num = parseFloat(value)
    if (!Number.isFinite(num)) return 0

    switch (unit) {
      case 'l':
        return num * 1000
      case 'glass':
        return num * 250
      case 'bottle':
        return num * 500
      case 'ml':
      default:
        return num
    }
  }

  const addWater = async () => {
    const mlValue = convertToMl(inputs.water, inputs.waterUnit)
    if (!mlValue || mlValue <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid water amount.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await api.post('/api/health-records', {
        type: 'water',
        value: mlValue,
        unit: 'ml',
        date: selectedDate,
      })
      setInputs((prev) => ({ ...prev, water: '' }))
      await fetchSummary()
      setMessage({ type: 'success', text: `${mlValue} ml water added successfully.` })
    } catch (error) {
      console.error('Failed to add water:', error)
      setMessage({ type: 'error', text: 'Unable to save water record.' })
    } finally {
      setLoading(false)
    }
  }

  const addExercise = async () => {
    const value = parseFloat(inputs.exercise)
    if (!Number.isFinite(value) || value <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid exercise time.' })
      return
    }

    const minutes = inputs.exerciseUnit === 'hour' ? value * 60 : value

    setLoading(true)
    setMessage(null)

    try {
      await api.post('/api/health-records', {
        type: 'exercise',
        value: minutes,
        unit: 'min',
        date: selectedDate,
      })
      setInputs((prev) => ({ ...prev, exercise: '' }))
      await fetchSummary()
      setMessage({ type: 'success', text: `${minutes} min exercise added successfully.` })
    } catch (error) {
      console.error('Failed to add exercise:', error)
      setMessage({ type: 'error', text: 'Unable to save exercise record.' })
    } finally {
      setLoading(false)
    }
  }

  const addSleep = async () => {
    const value = parseFloat(inputs.sleep)
    if (!Number.isFinite(value) || value <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid sleep duration.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await api.post('/api/health-records', {
        type: 'sleep',
        value: value,
        unit: 'hours',
        date: selectedDate,
      })
      setInputs((prev) => ({ ...prev, sleep: '' }))
      await fetchSummary()
      setMessage({ type: 'success', text: `${value} hours sleep added successfully.` })
    } catch (error) {
      console.error('Failed to add sleep:', error)
      setMessage({ type: 'error', text: 'Unable to save sleep record.' })
    } finally {
      setLoading(false)
    }
  }

  const waterTarget = healthProfile?.metrics?.water ? Math.round(healthProfile.metrics.water * 1000) : 3000
  const waterIntake = summary.water || 0
  const waterRemaining = Math.max(waterTarget - waterIntake, 0)
  const waterPercent = waterTarget ? Math.min(Math.round((waterIntake / waterTarget) * 100), 100) : 0

  const exerciseTarget = 45
  const exerciseCompleted = summary.exercise || 0
  const exerciseRemaining = Math.max(exerciseTarget - exerciseCompleted, 0)
  const exercisePercent = exerciseTarget ? Math.min(Math.round((exerciseCompleted / exerciseTarget) * 100), 100) : 0

  const sleepTarget = healthProfile?.metrics?.sleep || 8
  const sleepCurrent = summary.sleep || 0
  const sleepRemaining = Math.max(sleepTarget - sleepCurrent, 0)
  const sleepPercent = sleepTarget ? Math.min(Math.round((sleepCurrent / sleepTarget) * 100), 100) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Fitness Tracker</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Track Water, Exercise & Sleep</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 max-w-2xl">
              Log your daily fitness activities and stay on track with your wellness goals.
            </p>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span>Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Water Progress */}
          <div className="rounded-[2rem] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Water Intake</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{Math.round(waterIntake)} ml</h3>
                <p className="mt-1 text-sm text-slate-600">Target: {waterTarget} ml</p>
              </div>
              <FaTint className="h-8 w-8 text-cyan-600" />
            </div>
            <div className="mt-4 rounded-full bg-white/90 p-1">
              <div className="h-3 rounded-full bg-cyan-600" style={{ width: `${waterPercent}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{waterPercent}% completed</p>

            <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={inputs.water}
                  onChange={(e) => setInputs((prev) => ({ ...prev, water: e.target.value }))}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                />
                <select
                  value={inputs.waterUnit}
                  onChange={(e) => setInputs((prev) => ({ ...prev, waterUnit: e.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                >
                  <option value="ml">ml</option>
                  <option value="l">L</option>
                  <option value="glass">glass</option>
                  <option value="bottle">bottle</option>
                </select>
              </div>
              <button
                onClick={addWater}
                disabled={loading}
                className="w-full rounded-3xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
              >
                Add Water
              </button>
            </div>
          </div>

          {/* Exercise Progress */}
          <div className="rounded-[2rem] border border-green-200 bg-green-50/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-green-600">Exercise</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{Math.round(exerciseCompleted)} min</h3>
                <p className="mt-1 text-sm text-slate-600">Target: {exerciseTarget} min</p>
              </div>
              <FiActivity className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 rounded-full bg-white/90 p-1">
              <div className="h-3 rounded-full bg-green-600" style={{ width: `${exercisePercent}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{exercisePercent}% completed</p>

            <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Duration"
                  value={inputs.exercise}
                  onChange={(e) => setInputs((prev) => ({ ...prev, exercise: e.target.value }))}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                />
                <select
                  value={inputs.exerciseUnit}
                  onChange={(e) => setInputs((prev) => ({ ...prev, exerciseUnit: e.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                >
                  <option value="min">min</option>
                  <option value="hour">hour</option>
                </select>
              </div>
              <button
                onClick={addExercise}
                disabled={loading}
                className="w-full rounded-3xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                Add Exercise
              </button>
            </div>
          </div>

          {/* Sleep Progress */}
          <div className="rounded-[2rem] border border-purple-200 bg-purple-50/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-600">Sleep</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{sleepCurrent.toFixed(1)} hrs</h3>
                <p className="mt-1 text-sm text-slate-600">Target: {sleepTarget} hrs</p>
              </div>
              <FiMoon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 rounded-full bg-white/90 p-1">
              <div className="h-3 rounded-full bg-purple-600" style={{ width: `${sleepPercent}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{sleepPercent}% of target</p>

            <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
              <input
                type="number"
                placeholder="Hours"
                step="0.5"
                value={inputs.sleep}
                onChange={(e) => setInputs((prev) => ({ ...prev, sleep: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
              />
              <button
                onClick={addSleep}
                disabled={loading}
                className="w-full rounded-3xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                Log Sleep
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-6 rounded-3xl p-4 text-sm ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}

export default FitnessTracker
