import { useState } from 'react'
import { AiOutlineUser, AiOutlineCheckCircle } from 'react-icons/ai'

function HealthProfileForm({ onProfileSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    age: initialData.age || '',
    gender: initialData.gender || '',
    height: initialData.height || '',
    weight: initialData.weight || '',
    activityLevel: initialData.activityLevel || 'moderate',
    fitnessGoal: initialData.fitnessGoal || 'maintenance',
  })

  const [metrics, setMetrics] = useState({
    bmi: null,
    bmiCategory: null,
    calories: null,
    water: null,
    sleep: null,
  })

  const [isExpanded, setIsExpanded] = useState(!initialData.age)

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little exercise)' },
    { value: 'light', label: 'Light (1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (intense/2x/day)' },
  ]

  const fitnessGoals = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'maintenance', label: 'Maintain Weight' },
    { value: 'weight_gain', label: 'Weight Gain' },
  ]

  const calculateMetrics = (data) => {
    const { age, gender, height, weight, activityLevel, fitnessGoal } = data

    // Prevent calculations if required fields are empty
    if (!height || !weight || isNaN(height) || isNaN(weight)) {
      setMetrics({
        bmi: null,
        bmiCategory: null,
        calories: null,
        water: null,
        sleep: null,
      })
      return
    }

    // Calculate BMI
    const heightM = parseFloat(height) / 100
    const weightVal = parseFloat(weight)
    const bmi = weightVal / (heightM * heightM)
    const bmiRounded = Math.round(bmi * 10) / 10

    let category = 'Normal'
    if (bmiRounded < 18.5) category = 'Underweight'
    else if (bmiRounded >= 18.5 && bmiRounded < 25) category = 'Normal'
    else if (bmiRounded >= 25 && bmiRounded < 30) category = 'Overweight'
    else if (bmiRounded >= 30) category = 'Obese'

    // Calculate calories only if age and gender are provided
    let calories = null
    let water = null
    let sleep = null

    if (age && gender) {
      let bmr = 0
      const ageVal = parseInt(age)
      if (gender.toLowerCase() === 'male') {
        bmr = 10 * weightVal + 6.25 * parseFloat(height) - 5 * ageVal + 5
      } else {
        bmr = 10 * weightVal + 6.25 * parseFloat(height) - 5 * ageVal - 161
      }

      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      }

      const multiplier = activityMultipliers[activityLevel] || 1.55
      const tdee = Math.round(bmr * multiplier)

      calories = {
        maintenance: tdee,
        loss: Math.round(tdee * 0.8),
        gain: Math.round(tdee * 1.2),
      }

      sleep = ageVal < 18 ? 9 : ageVal > 65 ? 7 : 8
    }

    water = Math.round((weightVal * 0.03 * 100) / 100 * 10) / 10

    setMetrics({
      bmi: bmiRounded,
      bmiCategory: category,
      calories,
      water,
      sleep,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }
    setFormData(updated)
    calculateMetrics(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
      alert('Please fill in all required fields')
      return
    }

    const profileData = {
      ...formData,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      metrics,
    }

    // Save to localStorage for dashboard
    localStorage.setItem('healthProfile', JSON.stringify(profileData))

    onProfileSubmit(profileData)

    setIsExpanded(false)
  }

  const hasProfile = formData.age && formData.gender && formData.height && formData.weight

  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-glass backdrop-blur-xl">
      {hasProfile && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full rounded-3xl bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 text-left transition hover:from-cyan-100 hover:to-blue-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Health Profile</p>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500">Age</p>
                  <p className="text-lg font-semibold text-slate-950">{formData?.age || 'N/A'} yrs</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">BMI</p>
                  <p className="text-lg font-semibold text-slate-950">{metrics?.bmi || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Calories</p>
                  <p className="text-lg font-semibold text-slate-950">{metrics?.calories?.maintenance || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Water</p>
                  <p className="text-lg font-semibold text-slate-950">{metrics?.water || 'N/A'}L</p>
                </div>
              </div>
            </div>
            <AiOutlineCheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </button>
      )}

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Health Profile Setup</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Tell us about yourself</h2>
            <p className="mt-1 text-sm text-slate-600">We'll personalize your health recommendations based on your profile.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700">
                Age <span className="text-rose-600">*</span>
              </label>
              <input
                id="age"
                type="number"
                name="age"
                value={formData?.age || ''}
                onChange={handleChange}
                min="1"
                max="150"
                placeholder="25"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 placeholder-slate-400 transition focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700">
                Gender <span className="text-rose-600">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData?.gender || ''}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-slate-700">
                Height (cm) <span className="text-rose-600">*</span>
              </label>
              <input
                id="height"
                type="number"
                name="height"
                value={formData?.height || ''}
                onChange={handleChange}
                step="0.1"
                min="50"
                max="300"
                placeholder="175"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 placeholder-slate-400 transition focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-slate-700">
                Weight (kg) <span className="text-rose-600">*</span>
              </label>
              <input
                id="weight"
                type="number"
                name="weight"
                value={formData?.weight || ''}
                onChange={handleChange}
                step="0.1"
                min="20"
                max="500"
                placeholder="70"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 placeholder-slate-400 transition focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Activity Level <span className="text-rose-600">*</span>
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {activityLevels.map((level) => (
                <label
                  key={level.value}
                  className="flex cursor-pointer items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.value}
                    checked={formData?.activityLevel === level.value}
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer text-cyan-600"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Fitness Goal <span className="text-rose-600">*</span>
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {fitnessGoals.map((goal) => (
                <label
                  key={goal.value}
                  className="flex cursor-pointer items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <input
                    type="radio"
                    name="fitnessGoal"
                    value={goal.value}
                    checked={formData?.fitnessGoal === goal.value}
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer text-cyan-600"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Calculated Metrics Display */}
          {metrics?.bmi && (
            <div className="rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Calculated Metrics</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500">BMI Score</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">{metrics?.bmi || 'N/A'}</p>
                  <p className="mt-1 text-xs font-medium text-cyan-600">{metrics?.bmiCategory || 'N/A'}</p>
                </div>
                {metrics?.calories && (
                  <div>
                    <p className="text-xs text-slate-500">Daily Calories</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">{metrics?.calories?.maintenance || 'N/A'}</p>
                    <p className="mt-1 text-xs text-slate-500">Maintenance</p>
                  </div>
                )}
                {metrics?.water && (
                  <div>
                    <p className="text-xs text-slate-500">Daily Water</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">{metrics?.water || 'N/A'}L</p>
                    <p className="mt-1 text-xs text-slate-500">Recommended</p>
                  </div>
                )}
                {metrics?.sleep && (
                  <div>
                    <p className="text-xs text-slate-500">Sleep Duration</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">{metrics?.sleep || 'N/A'}hrs</p>
                    <p className="mt-1 text-xs text-slate-500">Per night</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {hasProfile && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white transition hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
            >
              Save Profile & Start Chat
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default HealthProfileForm
