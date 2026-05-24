import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { storage } from '../services/storage'
import { FiPlus, FiActivity, FiMoon } from 'react-icons/fi'
import { FaTint } from 'react-icons/fa'
import { AiOutlineFire, AiOutlineCheckCircle } from 'react-icons/ai'

function CaloriesTracker() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)
  const [foodLoading, setFoodLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [recordInputs, setRecordInputs] = useState({ water: '', calories: '', exercise: '', sleep: '' })
  const [foodInput, setFoodInput] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [healthProfile, setHealthProfile] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState('maintenance')
  const [message, setMessage] = useState(null)

  const normalizeAnalysisItem = (rawItem) => {
    if (!rawItem || typeof rawItem !== 'object') return {}
    const item = { ...rawItem }

    const normalizeField = (value) => {
      if (value == null) return undefined
      if (typeof value === 'object') {
        if (value.food || value.description) return String(value.food || value.description)
        if (value.quantity || value.value) return String(value.quantity || value.value)
        return JSON.stringify(value)
      }
      return String(value)
    }

    item.food = normalizeField(item.food)
    item.description = normalizeField(item.description)
    item.quantity = normalizeField(item.quantity)
    item.note = normalizeField(item.note)
    item.item_type = normalizeField(item.item_type)
    item.volume_ml = normalizeField(item.volume_ml)

    item.calories = Number.isFinite(Number(item.calories)) ? Number(item.calories) : 0
    item.protein = Number.isFinite(Number(item.protein)) ? Number(item.protein) : item.protein
    item.carbs = Number.isFinite(Number(item.carbs)) ? Number(item.carbs) : item.carbs
    item.fats = Number.isFinite(Number(item.fats)) ? Number(item.fats) : item.fats

    return item
  }

  const formatMacro = (value) => {
    if (value == null || value === '') return 'N/A'
    const parsed = Number(String(value).replace(/[^\d.-]/g, ''))
    if (Number.isFinite(parsed)) return `${Math.round(parsed)}g`
    return String(value)
  }

  const formatItemLabel = (item) => {
    if (!item) return 'Food item'
    return item.food || item.description || 'Food item'
  }

  const formatItemQuantity = (item) => {
    if (!item) return '1 serving'
    if (item.item_type === 'water') {
      return item.volume_ml ? `${item.volume_ml} ml` : item.quantity || 'Water'
    }
    return item.quantity || '1 serving'
  }

  const formatSuggestion = (suggestion) => {
    if (!suggestion) return 'Healthy meal suggestion'
    if (typeof suggestion === 'string') return suggestion
    const item = normalizeAnalysisItem(suggestion)
    const label = formatItemLabel(item)
    const quantity = formatItemQuantity(item)
    const calories = item.calories ? ` - ${Math.round(item.calories)} kcal` : ''
    return `${label}${quantity ? ` (${quantity})` : ''}${calories}`
  }

  const getRecordDescription = (item) => {
    if (!item) return 'Food item'
    if (typeof item.description === 'string' && item.description) return item.description
    if (typeof item.food === 'string' && item.food) return item.food
    return 'Food item'
  }

  const getRecordQuantity = (item) => {
    if (!item) return '1 serving'
    if (item.volume_ml) return `${item.volume_ml} ml`
    return item.quantity || '1 serving'
  }

  const recordTypes = [
    { type: 'food', label: 'Calories Consumed', unit: 'kcal', icon: AiOutlineFire, color: 'text-rose-600' },
    { type: 'water', label: 'Water Intake', unit: 'ml', icon: FaTint, color: 'text-blue-600' },
    { type: 'exercise', label: 'Exercise', unit: 'min', icon: FiActivity, color: 'text-green-600' },
    { type: 'sleep', label: 'Sleep', unit: 'hours', icon: FiMoon, color: 'text-purple-600' },
  ]

  useEffect(() => {
    if (user) {
      loadProfile()
      fetchRecords()
      fetchSummary()
    }
  }, [user, selectedDate])

  const loadProfile = () => {
    const stored = storage.getItem('healthProfile', user) || storage.getItem('healthProfile', 'guest')
    if (stored) {
      const profile = JSON.parse(stored)
      setHealthProfile(profile)
      setSelectedGoal(profile.fitnessGoal || 'maintenance')
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await api.get('/api/health-records', {
        params: { date: selectedDate }
      })
      setRecords(response.data.records)
    } catch (error) {
      console.error('Failed to fetch health records:', error)
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

  const addRecord = async (type, value, unit) => {
    if (!value || value <= 0) return

    setLoading(true)
    setMessage(null)

    try {
      await api.post('/api/health-records', {
        type,
        value: parseFloat(value),
        unit,
        date: selectedDate,
      })
      setRecordInputs((prev) => ({ ...prev, [type]: '' }))
      await fetchRecords()
      await fetchSummary()
      setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully.` })
    } catch (error) {
      console.error('Failed to add health record:', error)
      setMessage({ type: 'error', text: 'Unable to save the record. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const logFoodItems = async () => {
    const lines = foodInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (!lines.length) {
      setMessage({ type: 'error', text: 'Enter at least one food or drink item.' })
      return
    }

    setFoodLoading(true)
    setMessage(null)

    try {
      const response = await api.post('/api/food-log', {
        items: lines,
        goal: selectedGoal,
        date: selectedDate,
        maintenance: healthProfile?.metrics?.calories?.maintenance,
      })
      setAnalysisResult(response.data.analysis || null)
      setFoodInput('')
      await fetchRecords()
      await fetchSummary()
      setMessage({ type: 'success', text: 'Food items logged and analyzed successfully.' })
    } catch (error) {
      console.error('Failed to log food items:', error)
      setMessage({ type: 'error', text: 'Unable to analyze food items. Please try again.' })
    } finally {
      setFoodLoading(false)
    }
  }

  const getRecordTypeInfo = (type) => {
    return recordTypes.find(rt => rt.type === type) || {}
  }

  const getGoalTarget = () => {
    const maintenance = healthProfile?.metrics?.calories?.maintenance || 2200
    if (selectedGoal === 'weight_gain') return healthProfile?.metrics?.calories?.gain || Math.round(maintenance * 1.2)
    if (selectedGoal === 'weight_loss') return healthProfile?.metrics?.calories?.loss || Math.round(maintenance * 0.8)
    return maintenance
  }

  const getSuggestions = () => {
    const fallback = {
      weight_gain: [
        'Peanut butter sandwich',
        'Paneer bhurji with paratha',
        'Banana smoothie with milk and nuts',
        'Dry fruits and seeds mix',
      ],
      weight_loss: [
        'Grilled chicken salad',
        'Greek yogurt with cucumber',
        'Mixed dal soup with veggies',
        'Sprouted moong chaat',
      ],
      maintenance: [
        'Chapati with sabzi and dal',
        'Brown rice with vegetable curry',
        'Raita with salad',
        'Fruit bowl with nuts',
      ],
    }

    const rawSuggestions = Array.isArray(analysisResult?.suggestions) && analysisResult?.suggestions.length
      ? analysisResult.suggestions
      : fallback[selectedGoal] || fallback.maintenance

    return rawSuggestions.map(formatSuggestion)
  }

  const foodRecords = records.filter((record) => record.record_type === 'food')
  const otherRecords = records.filter((record) => record.record_type !== 'food')

  const targetCalories = getGoalTarget()
  const currentIntake = summary.calories || 0
  const remainingCalories = Math.max(targetCalories - currentIntake, 0)
  const progressPercent = targetCalories ? Math.min(Math.round((currentIntake / targetCalories) * 100), 100) : 0

  const parseNotes = (notes) => {
    if (!notes) return {}
    try {
      return JSON.parse(notes)
    } catch {
      return { description: notes }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Calories Tracker</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">AI-powered Nutrition Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 max-w-2xl">
              Log foods, estimate calories and macros, and stay on target with intelligent food suggestions.
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
            <div className="flex items-center justify-between">
              <span>Goal</span>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="maintenance">Maintain Weight</option>
                <option value="weight_gain">Weight Gain</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recordTypes.map(({ type, label, unit, icon: Icon, color }) => (
            <div key={type} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <p className="mt-5 text-4xl font-semibold text-slate-950">
                {type === 'food' ? Math.round(summary.food || 0) : Math.round(summary[type] || 0)}
              </p>
              <p className="mt-2 text-sm text-slate-600">{unit}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Calorie Goal</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{targetCalories} kcal daily</h3>
              <p className="mt-1 text-sm text-slate-600">Current intake: {Math.round(currentIntake)} kcal</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Remaining</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{Math.round(remainingCalories)} kcal</p>
            </div>
          </div>

          <div className="mt-6 rounded-full bg-white/90 p-1">
            <div className="h-3 rounded-full bg-cyan-600" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-600">Goal progress: {progressPercent}%</p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Food Logger</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Add meals and snacks</h3>
                </div>
                <AiOutlineCheckCircle className="h-8 w-8 text-cyan-600" />
              </div>

              <textarea
                rows={4}
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder="2 bananas\n1 glass milk\nchicken rice\n2 chapati\ncoffee"
                className="mt-5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Enter each food or drink item on a new line.</p>
                <button
                  onClick={logFoodItems}
                  disabled={foodLoading}
                  className="inline-flex items-center justify-center rounded-3xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
                >
                  {foodLoading ? 'Analyzing...' : 'Analyze & Save'}
                </button>
              </div>

              {analysisResult?.items?.length > 0 && (
                <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">AI Food Breakdown</p>
                  <div className="space-y-3">
                    {analysisResult.items.map((rawItem, index) => {
                      const item = normalizeAnalysisItem(rawItem)
                      return (
                        <div key={`${formatItemLabel(item)}-${index}`} className="rounded-3xl bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{formatItemLabel(item)}</p>
                              <p className="text-sm text-slate-500">{formatItemQuantity(item)}</p>
                            </div>
                            <p className="text-lg font-semibold text-slate-950">{Math.round(item.calories || 0)} kcal</p>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-100 p-3 text-xs text-slate-600">Protein: {formatMacro(item.protein)}</div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-xs text-slate-600">Carbs: {formatMacro(item.carbs)}</div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-xs text-slate-600">Fats: {formatMacro(item.fats)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AI Recommendations</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Foods to complete your goal</h3>
              <p className="mt-2 text-sm text-slate-600">You still need around {Math.round(remainingCalories)} kcal today.</p>
              <ul className="mt-4 space-y-3">
                {getSuggestions().map((suggestion, index) => (
                  <li key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Food History</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Today's Food Log</h3>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {foodRecords.length === 0 ? (
                  <p className="text-sm text-slate-500">No food entries added yet.</p>
                ) : (
                  foodRecords.map((record) => {
                    const item = parseNotes(record.notes)
                    return (
                      <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{getRecordDescription(item)}</p>
                            <p className="text-sm text-slate-500">{getRecordQuantity(item)}</p>
                          </div>
                          <p className="font-semibold text-slate-900">{Math.round(record.value)} kcal</p>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs text-slate-600">
                          <span>Protein: {item.protein || 'N/A'}</span>
                          <span>Carbs: {item.carbs || 'N/A'}</span>
                          <span>Fats: {item.fats || 'N/A'}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Lifestyle Summary</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Other health data</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {otherRecords.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No activity or sleep entries yet.</div>
                ) : (
                  otherRecords.map((record) => (
                    <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900 capitalize">{record.record_type}</p>
                      <p className="mt-1 text-sm text-slate-600">{record.value} {record.unit}</p>
                      <p className="mt-2 text-xs text-slate-500">{new Date(record.created_at).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
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

export default CaloriesTracker