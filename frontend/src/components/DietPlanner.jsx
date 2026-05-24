import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { storage } from '../services/storage'
import { AiOutlineFile } from 'react-icons/ai'

function DietPlanner() {
  const { user } = useAuth()
  const [healthProfile, setHealthProfile] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState('maintenance')
  const [selectedPlan, setSelectedPlan] = useState('daily')
  const [dietPlan, setDietPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = () => {
    const stored = storage.getItem('healthProfile', user) || storage.getItem('healthProfile', 'guest')
    if (stored) {
      const profile = JSON.parse(stored)
      setHealthProfile(profile)
      setSelectedGoal(profile.fitnessGoal || 'maintenance')
    }
  }

  const generateDietPlan = async (planType) => {
    if (!healthProfile?.metrics?.calories?.maintenance) {
      setMessage({ type: 'error', text: 'Please complete your health profile first.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const prompt = generatePlanPrompt(planType, selectedGoal)
      const response = await api.post('/api/chat', {
        message: prompt,
        age: healthProfile.age,
        gender: healthProfile.gender,
        weight: healthProfile.weight,
        height: healthProfile.height,
        activityLevel: healthProfile.activityLevel,
        fitnessGoal: selectedGoal,
      })

      if (response.data.success) {
        setDietPlan({
          type: planType,
          content: response.data.reply,
        })
        setMessage({ type: 'success', text: 'Diet plan generated successfully!' })
      }
    } catch (error) {
      console.error('Failed to generate diet plan:', error)
      setMessage({ type: 'error', text: 'Unable to generate diet plan. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const generatePlanPrompt = (planType, goal) => {
    const goalText = {
      weight_gain: 'weight gain (high calories)',
      weight_loss: 'weight loss (calorie deficit)',
      maintenance: 'weight maintenance',
    }[goal] || 'general wellness'

    const baseCalories = healthProfile?.metrics?.calories?.maintenance || 2200

    if (planType === 'daily') {
      return `Generate a complete 1-day diet plan for ${goalText}. Target: ${baseCalories} kcal. Include breakfast, lunch, dinner, and 2 snacks with approximate calories and macros. Use Indian foods. Format as clear sections with bullet points.`
    } else if (planType === 'weekly') {
      return `Generate a 7-day diet plan for ${goalText}. Target: ${baseCalories} kcal per day. Include breakfast, lunch, dinner, and snacks for each day. Use Indian foods and ensure variety. Format with day-by-day breakdown.`
    } else if (planType === 'monthly') {
      return `Generate a 4-week diet plan for ${goalText}. Target: ${baseCalories} kcal per day. Provide weekly themes and key meals for each week. Use Indian foods. Ensure nutritional variety. Format with Week 1-4 structure.`
    }
  }

  const getMaintenanceCalories = () => {
    return healthProfile?.metrics?.calories?.maintenance || 2200
  }

  const getGoalTarget = () => {
    const maintenance = getMaintenanceCalories()
    if (selectedGoal === 'weight_gain') return Math.round(maintenance * 1.2)
    if (selectedGoal === 'weight_loss') return Math.round(maintenance * 0.8)
    return maintenance
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-glass">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Diet Planner</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">AI-Powered Diet Plans</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 max-w-2xl">
              Generate personalized diet plans based on your fitness goals and calorie targets.
            </p>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
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
            <div className="flex items-center justify-between">
              <span>Target Calories</span>
              <span className="font-semibold">{getGoalTarget()} kcal</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { id: 'daily', label: '📅 Daily Plan', desc: '1 day meal plan' },
            { id: 'weekly', label: '📆 Weekly Plan', desc: '7 days meal plan' },
            { id: 'monthly', label: '📊 Monthly Plan', desc: '4 weeks meal plan' },
          ].map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => {
                setSelectedPlan(id)
                generateDietPlan(id)
              }}
              disabled={loading}
              className={`rounded-[2rem] border-2 p-6 text-left transition ${
                selectedPlan === id
                  ? 'border-cyan-600 bg-cyan-50 text-cyan-900'
                  : 'border-slate-200 bg-white hover:border-cyan-400'
              } disabled:opacity-50`}
            >
              <p className="text-lg font-semibold">{label}</p>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </button>
          ))}
        </div>

        {dietPlan && (
          <div className="mt-8 space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-3">
              <AiOutlineFile className="h-6 w-6 text-cyan-600" />
              <h3 className="text-xl font-semibold text-slate-950">
                {selectedPlan === 'daily' && 'Daily Diet Plan'}
                {selectedPlan === 'weekly' && 'Weekly Diet Plan'}
                {selectedPlan === 'monthly' && 'Monthly Diet Plan'}
              </h3>
            </div>

            <div className="rounded-3xl bg-white p-6 text-sm leading-relaxed text-slate-700 space-y-4 max-h-96 overflow-y-auto">
              {dietPlan.content.split('\n').map((line, idx) => {
                if (!line.trim()) return null
                if (line.startsWith('#')) {
                  return (
                    <h2 key={idx} className="text-lg font-bold text-slate-950 mt-4 mb-2">
                      {line.replace(/^#+\s*/, '')}
                    </h2>
                  )
                }
                if (line.startsWith('##')) {
                  return (
                    <h3 key={idx} className="text-base font-semibold text-slate-800 mt-3 mb-1">
                      {line.replace(/^#+\s*/, '')}
                    </h3>
                  )
                }
                if (line.startsWith('-') || line.startsWith('*')) {
                  return (
                    <div key={idx} className="ml-4 flex gap-3">
                      <span className="text-cyan-600 font-semibold">•</span>
                      <span>{line.replace(/^[-*]\s*/, '')}</span>
                    </div>
                  )
                }
                return (
                  <p key={idx} className="text-slate-700">
                    {line}
                  </p>
                )
              })}
            </div>

            <button
              onClick={() => {
                const element = document.createElement('a')
                element.setAttribute(
                  'href',
                  'data:text/plain;charset=utf-8,' + encodeURIComponent(dietPlan.content)
                )
                element.setAttribute('download', `diet-plan-${selectedPlan}.txt`)
                element.style.display = 'none'
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
              }}
              className="rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Download Plan
            </button>
          </div>
        )}

        {message && (
          <div className={`mt-6 rounded-3xl p-4 text-sm ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {message.text}
          </div>
        )}

        {loading && (
          <div className="mt-6 flex items-center justify-center rounded-3xl bg-slate-100 p-6">
            <div className="animate-spin">
              <div className="h-6 w-6 border-3 border-slate-300 border-t-cyan-600 rounded-full" />
            </div>
            <span className="ml-3 text-slate-700">Generating your diet plan...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DietPlanner
