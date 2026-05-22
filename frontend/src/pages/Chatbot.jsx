import { useState } from 'react'
import api from '../services/api'
import HealthProfileForm from '../components/HealthProfileForm'
import ChatInput from '../components/chatbot/ChatInput'
import ChatWindow from '../components/chatbot/ChatWindow'

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello! I am your personalized AI Healthcare Assistant. Now that I know your health profile, I can provide customized recommendations based on your age, fitness goal, and current health metrics. Ask me about diet, workouts, symptoms, or wellness advice!',
  timestamp: new Date().toISOString(),
}

const DEFAULT_HEALTH_PROFILE = {
  age: '',
  gender: '',
  height: '',
  weight: '',
  activityLevel: 'moderate',
  fitnessGoal: 'maintenance',
  metrics: null,
}

function Chatbot() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendError, setBackendError] = useState(false)
  const [healthProfile, setHealthProfile] = useState(DEFAULT_HEALTH_PROFILE)

  const getQuickQuestions = () => {
    if (!healthProfile?.age || !healthProfile?.metrics) return []

    const goal = healthProfile?.fitnessGoal || 'maintenance'
    const bmi = healthProfile?.metrics?.bmiCategory || 'Normal'

    const questionMap = {
      weight_loss: [
        'What foods help with weight loss?',
        'Best cardio exercises for me?',
        'How to maintain my calorie deficit?',
        'Healthy snacks under 100 kcal',
      ],
      weight_gain: [
        'How to gain muscle mass?',
        'High-calorie healthy foods?',
        'Best strength training routine?',
        'Protein-rich meal ideas',
      ],
      maintenance: [
        'How to maintain current weight?',
        'Balanced meal suggestions?',
        'Recommended daily routine?',
        'Tips for fitness maintenance',
      ],
    }

    return questionMap[goal] || questionMap.maintenance
  }

  const handleProfileSubmit = (profileData) => {
    setHealthProfile(profileData)
    // Reset chat with new personalized welcome message
    setMessages([INITIAL_MESSAGE])
    setError(null)
    setBackendError(false)
  }

  const handleSend = async (message) => {
    if (!message.trim() || loading) {
      return
    }

    setError(null)
    const timestamp = new Date().toISOString()
    const userMessage = {
      id: `user-${timestamp}`,
      role: 'user',
      text: message.trim(),
      timestamp,
    }

    setMessages((current) => [...current, userMessage])
    setLoading(true)

    try {
      console.log('Chat request:', userMessage.text)

      // Include health profile data with every chat request
      const chatPayload = {
        message: userMessage.text,
        age: healthProfile?.age || null,
        gender: healthProfile?.gender || null,
        height: healthProfile?.height || null,
        weight: healthProfile?.weight || null,
        activityLevel: healthProfile?.activityLevel || 'moderate',
        fitnessGoal: healthProfile?.fitnessGoal || 'maintenance',
      }

      const response = await api.post('/api/chat', chatPayload)
      console.log('Chat response data:', response?.data)

      const replyText =
        response?.data?.reply ||
        response?.data?.message ||
        'I could not generate a response. Please try again.'

      const assistantTimestamp = new Date().toISOString()
      const assistantMessage = {
        id: `assistant-${assistantTimestamp}`,
        role: 'assistant',
        text: replyText,
        timestamp: assistantTimestamp,
      }

      setMessages((current) => [...current, assistantMessage])
      setBackendError(false)
      setError(null)
    } catch (err) {
      console.error('Chat error:', err)
      setBackendError(true)
      const fallback =
        err?.response?.data?.reply ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to reach the AI assistant. Please check your backend and try again.'

      setError(fallback)
      const fallbackTimestamp = new Date().toISOString()
      const assistantMessage = {
        id: `assistant-${fallbackTimestamp}`,
        role: 'assistant',
        text: fallback,
        timestamp: fallbackTimestamp,
      }
      setMessages((current) => [...current, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (text) => {
    if (!loading) {
      handleSend(text)
    }
  }

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE])
    setError(null)
    setBackendError(false)
  }

  const quickQuestions = getQuickQuestions()

  return (
    <section className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Health Profile Form */}
        <HealthProfileForm onProfileSubmit={handleProfileSubmit} initialData={healthProfile} />

        {/* Main Chat Section */}
        {healthProfile?.age && healthProfile?.metrics ? (
          <>
            <div className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-glass backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Personalized Experience</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                    Your AI Healthcare Assistant
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {healthProfile?.metrics?.bmi && (
                      <div className="rounded-2xl bg-cyan-50 px-4 py-2">
                        <p className="text-xs text-cyan-600">BMI: {healthProfile?.metrics?.bmi}</p>
                        <p className="font-semibold text-cyan-900">{healthProfile?.metrics?.bmiCategory}</p>
                      </div>
                    )}
                    {healthProfile?.metrics?.calories?.maintenance && (
                      <div className="rounded-2xl bg-blue-50 px-4 py-2">
                        <p className="text-xs text-blue-600">Daily Calories</p>
                        <p className="font-semibold text-blue-900">{healthProfile?.metrics?.calories?.maintenance}</p>
                      </div>
                    )}
                    {healthProfile?.metrics?.water && (
                      <div className="rounded-2xl bg-purple-50 px-4 py-2">
                        <p className="text-xs text-purple-600">Water Daily</p>
                        <p className="font-semibold text-purple-900">{healthProfile?.metrics?.water}L</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-slate-900 px-4 py-3 text-sm text-white shadow-sm">
                  <span className={`flex h-3 w-3 rounded-full ${backendError ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                  {backendError ? 'Offline' : 'Online'}
                </div>
              </div>

              {backendError && (
                <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                  <p className="font-semibold">Backend connection lost</p>
                  <p className="mt-2 text-xs">Please check your backend server and refresh the page.</p>
                </div>
              )}

              {quickQuestions.length > 0 && (
                <div className="mt-8 space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Suggested for your goals
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSuggestion(question)}
                        disabled={loading}
                        className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-50 px-4 py-3 text-left text-sm text-slate-700 transition duration-200 hover:border-cyan-300 hover:to-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-glass backdrop-blur-xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Chat</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Talk to HealthAI</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:border-cyan-300 hover:bg-cyan-100"
                  >
                    Clear chat
                  </button>
                </div>

                <ChatWindow messages={messages} loading={loading} error={error} />
                <ChatInput onSend={handleSend} disabled={loading} />
              </div>

              <aside className="space-y-6 rounded-[2rem] border border-white/80 bg-slate-950/95 p-6 text-slate-100 shadow-glass backdrop-blur-xl">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">About this assistant</p>
                  <h3 className="text-xl font-semibold text-white">Personalized Health Guidance</h3>
                  <p className="text-sm leading-7 text-slate-300">
                    Your responses are tailored to your health profile including BMI, age, activity level, and fitness goals. Every recommendation considers your specific health metrics.
                  </p>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Your Metrics</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <div className="flex justify-between">
                      <span>Sleep Recommendation:</span>
                      <span className="font-semibold">{healthProfile.metrics?.sleep} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal Calories:</span>
                      <span className="font-semibold">{healthProfile.metrics?.calories?.gain} (gain)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal Calories:</span>
                      <span className="font-semibold">{healthProfile.metrics?.calories?.loss} (loss)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-rose-200">Important</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    HealthAI is an assistant, not a substitute for licensed medical advice. Always consult your doctor for diagnosis and treatment.
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default Chatbot
